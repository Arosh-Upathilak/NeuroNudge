package com.avidz.NeuroNudge

import android.app.Application
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.avidz.NeuroNudge.data.ApiMemory
import com.avidz.NeuroNudge.data.AppPreferences
import com.avidz.NeuroNudge.data.ChatItem
import com.avidz.NeuroNudge.data.PreferenceMutation
import com.avidz.NeuroNudge.data.requiredChatText
import com.avidz.NeuroNudge.ui.NotificationFeedItem
import com.avidz.NeuroNudge.ui.NotificationKind
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineStart
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.UUID

enum class BootstrapStatus { Pending, Succeeded, Failed }

data class AppUiState(
    val authReady: Boolean = false,
    val user: FirebaseUser? = null,
    val busy: Boolean = false,
    val error: String? = null,
    val resetEmail: String = "",
    val memories: List<ApiMemory> = emptyList(),
    val chat: List<ChatItem> = emptyList(),
    val loadingContent: Boolean = false,
    val bootstrapStatus: BootstrapStatus = BootstrapStatus.Pending,
    val notifications: List<NotificationFeedItem> = seedNotifications(),
)

class AppViewModel(application: Application) : AndroidViewModel(application) {
    private val app = application as NeuroNudgeApplication
    private val auth = app.auth
    private val api = app.api
    private val preferencesRepository = app.preferences
    private val _state = MutableStateFlow(AppUiState())
    val state: StateFlow<AppUiState> = _state.asStateFlow()
    val preferences = preferencesRepository.values.stateIn(viewModelScope, SharingStarted.Eagerly, AppPreferences())

    private var activeUid: String? = null
    private val userJobsByUid = mutableMapOf<String, MutableSet<Job>>()
    private var bootstrapJob: Job? = null
    private var preferenceCleanupJob: Job? = null

    private val authListener = FirebaseAuth.AuthStateListener { firebase ->
        handleAuthState(firebase.currentUser)
    }

    init {
        auth.firebase.addAuthStateListener(authListener)
    }

    override fun onCleared() {
        auth.firebase.removeAuthStateListener(authListener)
        cancelUserJobs()
    }

    fun clearError() { _state.value = _state.value.copy(error = null) }
    fun reportError(message: String) { _state.value = _state.value.copy(error = message) }

    /** Retries synchronization of a persisted Firebase user after a bootstrap failure. */
    fun retryBootstrap() {
        handleAuthState(auth.firebase.currentUser, force = true)
    }

    fun login(email: String, password: String) = task { auth.login(email, password) }
    fun signup(name: String, email: String, password: String) = task { auth.signup(name, email, password) }
    fun googleLogin(idToken: String) = task { auth.loginWithGoogle(idToken) }
    fun resendVerification() {
        val uid = auth.firebase.currentUser?.uid ?: return
        userTask(uid) { auth.resendVerification(uid) }
    }

    fun checkVerification() {
        val uid = auth.firebase.currentUser?.uid ?: return
        userTask(uid) {
            val verified = auth.reload(uid)
            if (verified && isCurrentFirebaseUid(uid)) {
                _state.value = _state.value.copy(
                    authReady = false,
                    user = null,
                    bootstrapStatus = BootstrapStatus.Pending,
                )
                startBootstrap(uid)
            } else if (isCurrentFirebaseUid(uid)) {
                _state.value = _state.value.copy(user = auth.firebase.currentUser)
            }
        }
    }

    fun forgotPassword(email: String, onSuccess: () -> Unit) = task(onSuccess) {
        auth.forgotPassword(email)
        _state.value = _state.value.copy(resetEmail = email.trim())
    }

    fun logout() {
        cancelUserJobs()
        activeUid = null
        auth.logout()
        _state.value = AppUiState(authReady = true)
        preferenceCleanupJob = viewModelScope.launch { preferencesRepository.clear() }
    }

    fun updateName(name: String, onSuccess: () -> Unit = {}) {
        val uid = auth.firebase.currentUser?.uid ?: return
        userTask(uid, onSuccess) {
            auth.updateName(uid, name)
            if (isCurrentUser(uid)) _state.value = _state.value.copy(user = auth.firebase.currentUser)
        }
    }

    fun refreshContent() {
        val uid = auth.firebase.currentUser?.takeIf { it.isEmailVerified }?.uid ?: return
        refreshContent(uid)
    }

    private fun refreshContent(uid: String) {
        if (!isCurrentUser(uid) || !_state.value.authReady || _state.value.loadingContent) return
        _state.value = _state.value.copy(loadingContent = true)
        launchUserJob(uid) {
            try {
                val memories = api.memories(uid)
                val messages = api.messages(uid).map { message ->
                    if (message.role == "user") ChatItem(message.messageId, true, message.content)
                    else api.decodeAssistant(message)
                }
                if (isCurrentUser(uid)) {
                    _state.value = _state.value.copy(memories = memories, chat = messages, loadingContent = false)
                }
            } catch (error: CancellationException) {
                throw error
            } catch (error: Throwable) {
                if (isCurrentUser(uid)) {
                    _state.value = _state.value.copy(loadingContent = false, error = friendlyError(error))
                }
            }
        }
    }

    fun sendChat(text: String, latitude: Double?, longitude: Double?, image: Uri?) {
        val normalizedText = requiredChatText(text) ?: return
        val uid = auth.firebase.currentUser?.takeIf { it.isEmailVerified }?.uid ?: return
        if (!isCurrentUser(uid)) return
        val userItem = ChatItem(UUID.randomUUID().toString(), true, normalizedText)
        val pending = ChatItem(UUID.randomUUID().toString(), false, "Thinking...", pending = true)
        _state.value = _state.value.copy(chat = _state.value.chat + userItem + pending)
        launchUserJob(uid) {
            try {
                val response = api.chat(uid, normalizedText, latitude, longitude, image)
                if (isCurrentUser(uid)) {
                    val reply = ChatItem(UUID.randomUUID().toString(), false, response.reply, response.memories.orEmpty())
                    _state.value = _state.value.copy(chat = _state.value.chat.filterNot { it.id == pending.id } + reply)
                    refreshContent(uid)
                }
            } catch (error: CancellationException) {
                throw error
            } catch (error: Throwable) {
                if (isCurrentUser(uid)) {
                    _state.value = _state.value.copy(
                        chat = _state.value.chat.filterNot { it.id == pending.id } +
                            ChatItem(UUID.randomUUID().toString(), false, friendlyError(error)),
                    )
                }
            }
        }
    }

    fun markRead(id: String) {
        _state.value = _state.value.copy(notifications = _state.value.notifications.map { if (it.id == id) it.copy(isRead = true) else it })
    }

    fun markAllRead() {
        _state.value = _state.value.copy(notifications = _state.value.notifications.map { it.copy(isRead = true) })
    }

    fun deleteNotification(id: String) {
        _state.value = _state.value.copy(notifications = _state.value.notifications.filterNot { it.id == id })
    }

    fun addThresholdNotification(level: Float) {
        val item = NotificationFeedItem(
            id = UUID.randomUUID().toString(),
            title = "Sound Sanctuary",
            message = "Ambient sound remained above your threshold (${level.toInt()} dB).",
            timeLabel = "Now",
            kind = NotificationKind.Reminder,
        )
        _state.value = _state.value.copy(notifications = listOf(item) + _state.value.notifications)
    }

    /** Applies the typed mutation against the current DataStore state atomically. */
    fun updatePreference(mutation: PreferenceMutation) {
        val uid = activeUid ?: return
        launchUserJob(uid) {
            if (isCurrentUser(uid)) preferencesRepository.update(mutation)
        }
    }

    fun clearUserData(onSuccess: () -> Unit = {}) {
        val uid = auth.firebase.currentUser?.uid ?: return
        cancelUserJobs()
        userTask(uid, onSuccess) {
            api.clearData(uid)
            if (isCurrentUser(uid)) {
                preferencesRepository.clear()
                _state.value = _state.value.copy(
                    memories = emptyList(),
                    chat = emptyList(),
                    loadingContent = false,
                    notifications = seedNotifications(),
                )
            }
        }
    }

    private fun handleAuthState(firebaseUser: FirebaseUser?, force: Boolean = false) {
        val nextUid = firebaseUser?.uid
        val sameReadyUser = !force && nextUid != null && nextUid == activeUid &&
            _state.value.authReady && _state.value.user?.uid == nextUid &&
            _state.value.user?.isEmailVerified == firebaseUser?.isEmailVerified
        if (sameReadyUser) return

        val previousUid = activeUid
        cancelUserJobs()
        activeUid = nextUid

        if (firebaseUser == null) {
            _state.value = AppUiState(authReady = true, bootstrapStatus = BootstrapStatus.Succeeded)
            if (previousUid != null) preferenceCleanupJob = viewModelScope.launch { preferencesRepository.clear() }
            return
        }
        val uid = nextUid ?: return

        if (!firebaseUser.isEmailVerified) {
            _state.value = AppUiState(
                authReady = true,
                user = firebaseUser,
                bootstrapStatus = BootstrapStatus.Succeeded,
            )
            if (previousUid != null && previousUid != uid) {
                preferenceCleanupJob = viewModelScope.launch { preferencesRepository.clear() }
            }
            return
        }

        // A verified persisted user is deliberately hidden until syncUser succeeds.
        _state.value = AppUiState(bootstrapStatus = BootstrapStatus.Pending)
        startBootstrap(uid, previousUid)
    }

    private fun startBootstrap(uid: String, previousUid: String? = null) {
        bootstrapJob?.cancel()
        _state.value = _state.value.copy(
            authReady = false,
            user = null,
            bootstrapStatus = BootstrapStatus.Pending,
            error = null,
        )
        bootstrapJob = launchUserJob(uid) {
            preferenceCleanupJob?.join()
            if (previousUid != null && previousUid != uid) preferencesRepository.clear()
            if (!isCurrentUser(uid)) return@launchUserJob
            try {
                api.syncUser(uid)
                if (isCurrentUser(uid)) {
                    _state.value = AppUiState(
                        authReady = true,
                        user = auth.firebase.currentUser,
                        bootstrapStatus = BootstrapStatus.Succeeded,
                    )
                    // Content loading starts only after verified-user synchronization succeeds.
                    refreshContent(uid)
                }
            } catch (error: CancellationException) {
                throw error
            } catch (error: Throwable) {
                // AuthFlow remains available as a visible retry path; MainFlow is not exposed.
                if (isCurrentFirebaseUid(uid)) {
                    _state.value = AppUiState(
                        authReady = true,
                        bootstrapStatus = BootstrapStatus.Failed,
                        error = "Unable to finish account setup: ${friendlyError(error)} Please sign in again to retry.",
                    )
                }
            }
        }
    }

    private fun isCurrentFirebaseUid(uid: String): Boolean = auth.firebase.currentUser?.uid == uid

    private fun isCurrentUser(uid: String): Boolean =
        activeUid == uid && auth.firebase.currentUser?.uid == uid && auth.firebase.currentUser?.isEmailVerified == true

    private fun cancelUserJobs() {
        userJobsByUid.values.flatten().forEach { it.cancel() }
        userJobsByUid.clear()
        bootstrapJob = null
    }

    private fun launchUserJob(uid: String, block: suspend () -> Unit): Job {
        lateinit var job: Job
        job = viewModelScope.launch(start = CoroutineStart.LAZY) {
            try {
                block()
            } finally {
                userJobsByUid[uid]?.remove(job)
                if (userJobsByUid[uid].isNullOrEmpty()) userJobsByUid.remove(uid)
            }
        }
        userJobsByUid.getOrPut(uid) { mutableSetOf() }.add(job)
        job.start()
        return job
    }

    private fun userTask(uid: String, onSuccess: () -> Unit = {}, block: suspend () -> Unit) {
        launchUserJob(uid) {
            if (!isCurrentFirebaseUid(uid)) return@launchUserJob
            _state.value = _state.value.copy(busy = true, error = null)
            try {
                block()
                if (isCurrentFirebaseUid(uid)) {
                    _state.value = _state.value.copy(busy = false)
                    onSuccess()
                }
            } catch (error: CancellationException) {
                throw error
            } catch (error: Throwable) {
                if (isCurrentFirebaseUid(uid)) {
                    _state.value = _state.value.copy(busy = false, error = friendlyError(error))
                }
            }
        }
    }

    private fun task(onSuccess: () -> Unit = {}, block: suspend () -> Unit) {
        viewModelScope.launch {
            _state.value = _state.value.copy(busy = true, error = null)
            runCatching { block() }
                .onSuccess { _state.value = _state.value.copy(busy = false); onSuccess() }
                .onFailure { _state.value = _state.value.copy(busy = false, error = friendlyError(it)) }
        }
    }
}

private fun friendlyError(error: Throwable): String {
    val message = error.message.orEmpty()
    return when {
        "INVALID_LOGIN_CREDENTIALS" in message || "credential is incorrect" in message -> "Incorrect email or password."
        "email address is already" in message -> "An account already exists for this email."
        "network" in message.lowercase() -> "Check your internet connection and try again."
        message.isNotBlank() -> message
        else -> "Something went wrong. Please try again."
    }
}

private fun seedNotifications() = listOf(
    NotificationFeedItem("welcome", "Welcome to NeuroNudge", "Your calm space is ready.", "Today", NotificationKind.Update),
    NotificationFeedItem("sound", "Sound Sanctuary", "Set a comfortable threshold for noisy moments.", "Today", NotificationKind.Reminder),
    NotificationFeedItem("memory", "Lost-to-Found", "Ask me where you left something important.", "Earlier", NotificationKind.Insight, true),
)
