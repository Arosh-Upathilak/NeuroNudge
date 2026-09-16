package com.avidz.NeuroNudge.ui

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.view.WindowManager
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalDrawerSheet
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationDrawerItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.avidz.NeuroNudge.AppViewModel
import com.avidz.NeuroNudge.R
import com.avidz.NeuroNudge.data.AppPreferences
import com.avidz.NeuroNudge.data.PreferenceField
import com.avidz.NeuroNudge.data.PreferenceMutation
import com.avidz.NeuroNudge.platform.AmbientNoiseMonitor
import com.avidz.NeuroNudge.platform.CameraTempUriHelper
import com.avidz.NeuroNudge.platform.CalibrationNoisePlayer
import com.avidz.NeuroNudge.platform.CurrentLocationProvider
import com.avidz.NeuroNudge.platform.NatureSoundPlayer
import com.avidz.NeuroNudge.platform.SoundpeatsController
import com.avidz.NeuroNudge.platform.SpeechRecognizerController
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.io.File

private enum class AuthPage { Login, Signup, Forgot, CheckEmail }
private enum class MainPage { Dashboard, Sanctuary, LostFound, Notifications, Settings }

private enum class PermissionRequestIntent {
    None,
    PreferenceToggle,
    ChatLocation,
    CameraCapture,
    SpeechRecognition,
    AmbientMonitoring,
    BluetoothConnection,
    NotificationToggle,
}

private enum class PermissionRequestType { Single, Multiple }

private data class RuntimePermissionState(
    val locationGranted: Boolean,
    val microphoneGranted: Boolean,
    val cameraGranted: Boolean,
    val bluetoothGranted: Boolean,
    val notificationsGranted: Boolean,
)

@Composable
fun NeuroNudgeApp(
    deepLinkText: String?,
    onDeepLinkConsumed: () -> Unit,
    appViewModel: AppViewModel = viewModel(),
) {
    val state by appViewModel.state.collectAsState()
    val preferences by appViewModel.preferences.collectAsState()
    val firebaseUser = FirebaseAuth.getInstance().currentUser
    val bootstrapFailure = state.authReady && state.user == null && state.error != null && firebaseUser != null

    NeuroNudgeTheme(darkTheme = preferences.darkMode) {
        when {
            !state.authReady -> CenteredLoading()
            bootstrapFailure -> BootstrapFailureScreen(
                errorMessage = state.error.orEmpty(),
                onRetry = appViewModel::retryBootstrap,
                onSignOut = appViewModel::logout,
                isLoading = state.busy,
            )
            state.user == null -> AuthFlow(appViewModel)
            state.user?.isEmailVerified != true -> VerifyEmailScreen(
                email = state.user?.email.orEmpty(),
                onCheckVerification = appViewModel::checkVerification,
                onResendEmail = appViewModel::resendVerification,
                onBackToLogin = appViewModel::logout,
                isLoading = state.busy,
                errorMessage = state.error,
            )
            else -> MainFlow(appViewModel, preferences, deepLinkText, onDeepLinkConsumed)
        }
    }
}

@Composable
private fun AuthFlow(viewModel: AppViewModel) {
    val context = LocalContext.current
    val state by viewModel.state.collectAsState()
    var page by rememberSaveable { mutableStateOf(AuthPage.Login) }
    val googleClient = remember {
        GoogleSignIn.getClient(
            context,
            GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken(context.getString(R.string.default_web_client_id))
                .requestEmail()
                .build(),
        )
    }
    val googleLauncher = rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            runCatching { GoogleSignIn.getSignedInAccountFromIntent(result.data).result.idToken }
                .onSuccess { token -> if (token != null) viewModel.googleLogin(token) else viewModel.reportError("Google did not return an ID token.") }
                .onFailure { viewModel.reportError(it.message ?: "Google sign-in failed.") }
        }
    }

    LaunchedEffect(page) { viewModel.clearError() }
    when (page) {
        AuthPage.Login -> LoginScreen(
            onLogin = viewModel::login,
            onGoogleClick = { googleClient.signOut().addOnCompleteListener { googleLauncher.launch(googleClient.signInIntent) } },
            onSignUpClick = { page = AuthPage.Signup },
            onForgotPasswordClick = { page = AuthPage.Forgot },
            isLoading = state.busy,
            errorMessage = state.error,
        )
        AuthPage.Signup -> SignUpScreen(viewModel::signup, { page = AuthPage.Login }, isLoading = state.busy, errorMessage = state.error)
        AuthPage.Forgot -> ForgotPasswordScreen(
            onSendResetLink = { viewModel.forgotPassword(it) { page = AuthPage.CheckEmail } },
            onBackToLogin = { page = AuthPage.Login },
            isLoading = state.busy,
            errorMessage = state.error,
        )
        AuthPage.CheckEmail -> CheckEmailScreen(
            email = state.resetEmail,
            onOpenEmail = { openEmail(context) },
            onBackToLogin = { page = AuthPage.Login },
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun MainFlow(
    viewModel: AppViewModel,
    preferences: AppPreferences,
    deepLinkText: String?,
    onDeepLinkConsumed: () -> Unit,
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val state by viewModel.state.collectAsState()
    val scope = rememberCoroutineScope()
    var page by rememberSaveable { mutableStateOf(MainPage.Dashboard) }
    var messageText by rememberSaveable { mutableStateOf("") }
    var searchText by rememberSaveable { mutableStateOf("") }
    var lostMode by rememberSaveable { mutableStateOf(LostFoundMode.Chat) }
    var imageTarget by remember { mutableStateOf<CameraTempUriHelper.CaptureTarget?>(null) }
    var pendingCameraUri by rememberSaveable { mutableStateOf<String?>(null) }
    var imageUri by rememberSaveable { mutableStateOf<String?>(null) }
    var pendingChatText by rememberSaveable { mutableStateOf<String?>(null) }
    var pendingChatImage by rememberSaveable { mutableStateOf<String?>(null) }
    var notificationFilter by rememberSaveable { mutableStateOf(NotificationFilter.All) }
    var settingsTab by rememberSaveable { mutableStateOf(SettingsTab.Profile) }
    var editingProfile by rememberSaveable { mutableStateOf(false) }
    var editedName by rememberSaveable(state.user?.displayName) { mutableStateOf(state.user?.displayName.orEmpty()) }
    val drawer = rememberDrawerState(DrawerValue.Closed)

    val locationProvider = remember { CurrentLocationProvider(context) }
    val speech = remember { SpeechRecognizerController(context) }
    val speechState by speech.state.collectAsState()
    val transcript by speech.transcript.collectAsState()
    val monitor = remember { AmbientNoiseMonitor(context) }
    val ambientDb by monitor.decibels.collectAsState()
    val player = remember { NatureSoundPlayer(context) }
    val calibrationNoise = remember { CalibrationNoisePlayer() }
    val playerState by player.state.collectAsState()
    val soundpeats = remember { SoundpeatsController(context) }
    val headphoneState by soundpeats.connectionState.collectAsState()
    var startSpeechAfterPermission by rememberSaveable { mutableStateOf(false) }
    var speechBase by remember { mutableStateOf("") }
    var pendingPermissionIntent by rememberSaveable { mutableStateOf(PermissionRequestIntent.None) }
    var pendingPreferenceFieldName by rememberSaveable { mutableStateOf<String?>(null) }
    var pendingPermissionType by rememberSaveable { mutableStateOf(PermissionRequestType.Single) }
    var pendingPermissionValue by rememberSaveable { mutableStateOf(false) }
    var runtimePermissions by remember { mutableStateOf(readRuntimePermissions(context)) }

    fun refreshRuntimePermissions() {
        runtimePermissions = readRuntimePermissions(context)
    }
    fun preferencePermissionGranted(field: PreferenceField): Boolean = when (field) {
        PreferenceField.LocationAccess -> runtimePermissions.locationGranted
        PreferenceField.MicrophoneAccess -> runtimePermissions.microphoneGranted
        PreferenceField.CameraAccess -> runtimePermissions.cameraGranted
        PreferenceField.BluetoothAccess -> runtimePermissions.bluetoothGranted
        PreferenceField.PushNotifications -> runtimePermissions.notificationsGranted
        else -> true
    }
    fun applyPreferenceMutation(mutation: PreferenceMutation) {
        viewModel.updatePreference(mutation)
    }
    LaunchedEffect(Unit) { refreshRuntimePermissions() }
    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) refreshRuntimePermissions()
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }
    fun submitWithLocation(text: String, attachedImage: String?) {
        if (text.isBlank()) return
        scope.launch {
            val location = if (preferences.locationAccess && runtimePermissions.locationGranted) {
                runCatching { locationProvider.getCurrentLocation() }.getOrNull()
            } else null
            viewModel.sendChat(text, location?.latitude, location?.longitude, attachedImage?.let(Uri::parse))
        }
        messageText = ""
        imageUri = null
    }

    val locationPermission = rememberLauncherForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) {
        refreshRuntimePermissions()
        val text = pendingChatText
        val image = pendingChatImage
        if (text != null && !preferencePermissionGranted(PreferenceField.LocationAccess)) {
            applyPreferenceMutation(PreferenceMutation.BooleanValue(PreferenceField.LocationAccess, false))
        }
        if (text != null) submitWithLocation(text, image)
        pendingChatText = null
        pendingChatImage = null
        pendingPermissionIntent = PermissionRequestIntent.None
    }
    val takePicture = rememberLauncherForActivityResult(ActivityResultContracts.TakePicture()) { saved ->
        refreshRuntimePermissions()
        val target = imageTarget ?: pendingCameraUri?.let { captureTargetFor(context, it) }
        if (saved && target != null) {
            imageUri = target.uri.toString()
        } else {
            target?.let(CameraTempUriHelper::delete)
        }
        imageTarget = null
        pendingCameraUri = null
        pendingPermissionIntent = PermissionRequestIntent.None
    }
    fun launchCameraCapture() {
        imageUri?.let { captureTargetFor(context, it)?.let(CameraTempUriHelper::delete) }
        imageUri = null
        val target = CameraTempUriHelper.create(context)
        imageTarget = target
        pendingCameraUri = target.uri.toString()
        takePicture.launch(target.uri)
    }
    val cameraPermission = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        refreshRuntimePermissions()
        if (granted) launchCameraCapture()
        else applyPreferenceMutation(PreferenceMutation.BooleanValue(PreferenceField.CameraAccess, false))
        pendingPermissionIntent = PermissionRequestIntent.None
    }
    val microphonePermission = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        refreshRuntimePermissions()
        if (granted && startSpeechAfterPermission) speech.startListening("en-US")
        if (granted && !startSpeechAfterPermission && page == MainPage.Sanctuary &&
            preferences.ambientEnabled && preferences.microphoneAccess
        ) {
            runCatching { monitor.start() }.onFailure { viewModel.reportError(it.message.orEmpty()) }
        }
        if (!granted) applyPreferenceMutation(PreferenceMutation.BooleanValue(PreferenceField.MicrophoneAccess, false))
        startSpeechAfterPermission = false
        pendingPermissionIntent = PermissionRequestIntent.None
    }
    val bluetoothPermission = rememberLauncherForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { grants ->
        refreshRuntimePermissions()
        if (grants[Manifest.permission.BLUETOOTH_CONNECT] == true && preferences.bluetoothAccess) {
            scope.launch { runCatching { soundpeats.connect() }.onFailure { viewModel.reportError(it.message.orEmpty()) } }
        } else if (Build.VERSION.SDK_INT >= 31) applyPreferenceMutation(PreferenceMutation.BooleanValue(PreferenceField.BluetoothAccess, false))
        pendingPermissionIntent = PermissionRequestIntent.None
    }
    val preferencePermission = rememberLauncherForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { grants ->
        refreshRuntimePermissions()
        val field = pendingPreferenceFieldName?.let { runCatching { PreferenceField.valueOf(it) }.getOrNull() }
        if (pendingPermissionIntent == PermissionRequestIntent.PreferenceToggle &&
            pendingPermissionType == PermissionRequestType.Multiple && field != null
        ) {
            val granted = pendingPermissionValue && preferencePermissionGranted(field)
            applyPreferenceMutation(PreferenceMutation.BooleanValue(field, granted))
            pendingPreferenceFieldName = null
        }
        pendingPermissionIntent = PermissionRequestIntent.None
    }
    val notificationPermission = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        refreshRuntimePermissions()
        if (pendingPermissionIntent == PermissionRequestIntent.NotificationToggle &&
            pendingPermissionType == PermissionRequestType.Single
        ) {
            applyPreferenceMutation(PreferenceMutation.BooleanValue(PreferenceField.PushNotifications, granted && preferencePermissionGranted(PreferenceField.PushNotifications)))
        }
        pendingPermissionIntent = PermissionRequestIntent.None
    }

    DisposableEffect(Unit) {
        onDispose { speech.close(); monitor.close(); player.close(); calibrationNoise.close(); soundpeats.close() }
    }
    DisposableEffect(page) {
        val activity = context as? Activity
        if (page == MainPage.Sanctuary) activity?.window?.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        onDispose { activity?.window?.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON) }
    }
    LaunchedEffect(page, preferences.ambientEnabled, preferences.microphoneAccess, runtimePermissions.microphoneGranted) {
        if (page == MainPage.Sanctuary && preferences.ambientEnabled && preferences.microphoneAccess && runtimePermissions.microphoneGranted) {
            runCatching { monitor.start() }.onFailure { viewModel.reportError(it.message.orEmpty()) }
        } else monitor.stop()
    }
    LaunchedEffect(transcript) {
        if (transcript.isNotBlank()) messageText = listOf(speechBase.trim(), transcript.trim()).filter(String::isNotEmpty).joinToString(" ")
    }
    LaunchedEffect(deepLinkText) {
        if (!deepLinkText.isNullOrBlank()) {
            page = MainPage.LostFound
            lostMode = LostFoundMode.Chat
            messageText = deepLinkText
            onDeepLinkConsumed()
        }
    }

    val settingsPreferences = preferences.copy(
        locationAccess = preferences.locationAccess && preferencePermissionGranted(PreferenceField.LocationAccess),
        microphoneAccess = preferences.microphoneAccess && preferencePermissionGranted(PreferenceField.MicrophoneAccess),
        cameraAccess = preferences.cameraAccess && preferencePermissionGranted(PreferenceField.CameraAccess),
        bluetoothAccess = preferences.bluetoothAccess && preferencePermissionGranted(PreferenceField.BluetoothAccess),
        pushNotifications = preferences.pushNotifications && preferencePermissionGranted(PreferenceField.PushNotifications),
    )

    val overThreshold = (ambientDb ?: 0f) >= preferences.threshold
    var thresholdActionActive by remember { mutableStateOf(false) }
    LaunchedEffect(overThreshold, preferences.sustainSeconds, preferences.thresholdAction, preferences.natureSound) {
        if (overThreshold && !thresholdActionActive) {
            delay(preferences.sustainSeconds * 1_000L)
            if ((monitor.decibels.value ?: 0f) >= preferences.threshold) {
                thresholdActionActive = true
                if (preferences.thresholdAlerts) {
                    context.getSystemService(android.os.Vibrator::class.java)?.let { vibrator ->
                        if (Build.VERSION.SDK_INT >= 26) vibrator.vibrate(
                            android.os.VibrationEffect.createOneShot(250, android.os.VibrationEffect.DEFAULT_AMPLITUDE),
                        ) else @Suppress("DEPRECATION") vibrator.vibrate(250)
                    }
                    viewModel.addThresholdNotification(monitor.decibels.value ?: preferences.threshold.toFloat())
                }
                if (preferences.thresholdAction in setOf("sound", "both")) player.play(soundUrl(preferences.natureSound), 1_500)
                if (preferences.thresholdAction in setOf("anc", "both") && headphoneState is SoundpeatsController.ConnectionState.Connected) {
                    scope.launch { runCatching { soundpeats.setMode(1) } }
                }
            }
        } else if (!overThreshold && thresholdActionActive) {
            thresholdActionActive = false
            player.stop(1_500)
            if (headphoneState is SoundpeatsController.ConnectionState.Connected) scope.launch { runCatching { soundpeats.setMode(0) } }
        }
    }

    ModalNavigationDrawer(
        drawerState = drawer,
        drawerContent = {
            ModalDrawerSheet {
                Text("NeuroNudge", style = MaterialTheme.typography.headlineSmall, modifier = Modifier.padding(24.dp))
                NavigationDrawerItem(
                    label = { Text("Settings") },
                    selected = false,
                    onClick = { page = MainPage.Settings; scope.launch { drawer.close() } },
                    icon = { Icon(Icons.Default.Settings, null) },
                )
                NavigationDrawerItem(label = { Text(if (preferences.darkMode) "Use light theme" else "Use dark theme") }, selected = false, onClick = {
                    applyPreferenceMutation(PreferenceMutation.BooleanValue(PreferenceField.DarkMode, !preferences.darkMode))
                })
                NavigationDrawerItem(label = { Text("Sign out") }, selected = false, onClick = viewModel::logout)
            }
        },
    ) {
        Scaffold(
            topBar = {
                if (page in setOf(MainPage.Dashboard, MainPage.Sanctuary, MainPage.LostFound)) {
                    TopAppBar(
                        title = { Text("NeuroNudge") },
                        navigationIcon = { IconButton({ scope.launch { drawer.open() } }) { Icon(Icons.Default.Menu, "Menu") } },
                        actions = { IconButton({ page = MainPage.Notifications }) { Icon(Icons.Default.Notifications, "Notifications") } },
                    )
                }
            },
            bottomBar = {
                if (page in setOf(MainPage.Dashboard, MainPage.Sanctuary, MainPage.LostFound)) {
                    NavigationBar {
                        MainTab(MainPage.Dashboard, page, "Dashboard", Icons.Default.Home) { page = it }
                        MainTab(MainPage.Sanctuary, page, "Sanctuary", Icons.Default.Psychology) { page = it }
                        MainTab(MainPage.LostFound, page, "Lost-Found", Icons.Default.Search) { page = it }
                    }
                }
            },
        ) { padding ->
            Box(Modifier.fillMaxSize().padding(padding)) {
                when (page) {
                    MainPage.Dashboard -> DashboardScreen(
                        state = DashboardState(
                            userName = state.user?.displayName ?: state.user?.email?.substringBefore('@').orEmpty(),
                            greeting = greeting(),
                            memoriesThisWeek = state.memories.size,
                            unreadNotifications = state.notifications.count { !it.isRead },
                            recentMemories = state.memories.take(3),
                            ambientMonitoringEnabled = preferences.ambientEnabled,
                        ),
                        onAddMemory = { page = MainPage.LostFound; lostMode = LostFoundMode.Chat },
                        onOpenMemory = { page = MainPage.LostFound; lostMode = LostFoundMode.Memories },
                        onOpenNotifications = { page = MainPage.Notifications },
                        onOpenChat = { page = MainPage.LostFound },
                        onAmbientMonitoringChange = { applyPreferenceMutation(PreferenceMutation.BooleanValue(PreferenceField.AmbientEnabled, it)) },
                    )
                    MainPage.LostFound -> LostFoundScreen(
                        chatItems = state.chat,
                        memories = state.memories,
                        messageText = messageText,
                        onMessageTextChange = { messageText = it },
                        onSendMessage = { text, image ->
                            if (preferences.locationAccess && !runtimePermissions.locationGranted) {
                                pendingChatText = text
                                pendingChatImage = image
                                pendingPermissionIntent = PermissionRequestIntent.ChatLocation
                                pendingPermissionType = PermissionRequestType.Multiple
                                locationPermission.launch(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION))
                            } else submitWithLocation(text, image)
                        },
                        onCameraClick = {
                            if (!preferences.cameraAccess) viewModel.reportError("Enable camera access in Privacy settings.")
                            else if (runtimePermissions.cameraGranted) launchCameraCapture()
                            else {
                                pendingPermissionIntent = PermissionRequestIntent.CameraCapture
                                pendingPermissionType = PermissionRequestType.Single
                                cameraPermission.launch(Manifest.permission.CAMERA)
                            }
                        },
                        onSpeechClick = {
                            if (!preferences.microphoneAccess) viewModel.reportError("Enable microphone access in Privacy settings.")
                            else {
                                speechBase = messageText
                                if (runtimePermissions.microphoneGranted) speech.startListening("en-US")
                                else {
                                    startSpeechAfterPermission = true
                                    pendingPermissionIntent = PermissionRequestIntent.SpeechRecognition
                                    pendingPermissionType = PermissionRequestType.Single
                                    microphonePermission.launch(Manifest.permission.RECORD_AUDIO)
                                }
                            }
                        },
                        onOpenMap = { lat, lng -> context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("geo:0,0?q=$lat,$lng"))) },
                        mode = lostMode,
                        onModeChange = { lostMode = it },
                        searchQuery = searchText,
                        onSearchQueryChange = { searchText = it },
                        imagePreviewUri = imageUri,
                        onRemoveImage = {
                            imageUri?.let { captureTargetFor(context, it)?.let(CameraTempUriHelper::delete) }
                            imageUri = null
                        },
                        isListening = speechState == SpeechRecognizerController.State.LISTENING,
                        isLoadingMemories = state.loadingContent,
                    )
                    MainPage.Sanctuary -> SanctuaryScreen(
                        ambientNoiseDb = ambientDb ?: 30f,
                        thresholdDb = preferences.threshold.toFloat(),
                        sustainDelaySeconds = preferences.sustainSeconds,
                        responseMode = runCatching { SanctuaryResponseMode.valueOf(preferences.thresholdAction.uppercase()) }.getOrDefault(SanctuaryResponseMode.NONE),
                        natureSound = runCatching { SanctuaryNatureSound.valueOf(preferences.natureSound.uppercase()) }.getOrDefault(SanctuaryNatureSound.OCEAN),
                        isNatureSoundPlaying = playerState == NatureSoundPlayer.State.PLAYING,
                        isSoundPeatsConnected = headphoneState is SoundpeatsController.ConnectionState.Connected,
                        hasMicrophonePermission = runtimePermissions.microphoneGranted,
                        hasBluetoothPermission = runtimePermissions.bluetoothGranted,
                        isMonitoringEnabled = preferences.ambientEnabled,
                        onThresholdChange = { applyPreferenceMutation(PreferenceMutation.IntValue(PreferenceField.Threshold, it.toInt())) },
                        onSustainDelayChange = { applyPreferenceMutation(PreferenceMutation.IntValue(PreferenceField.SustainSeconds, it)) },
                        onResponseModeChange = { applyPreferenceMutation(PreferenceMutation.StringValue(PreferenceField.ThresholdAction, it.name.lowercase())) },
                        onNatureSoundChange = { applyPreferenceMutation(PreferenceMutation.StringValue(PreferenceField.NatureSound, it.name.lowercase())) },
                        onNatureSoundPlaybackToggle = {
                            if (playerState == NatureSoundPlayer.State.PLAYING) player.pause() else player.play(soundUrl(preferences.natureSound), 1_500)
                        },
                        onMonitoringEnabledChange = { applyPreferenceMutation(PreferenceMutation.BooleanValue(PreferenceField.AmbientEnabled, it)) },
                        onSoundPeatsConnectionClick = {
                            if (!preferences.bluetoothAccess) {
                                viewModel.reportError("Enable Bluetooth access in Privacy settings.")
                            } else if (Build.VERSION.SDK_INT >= 31 && !runtimePermissions.bluetoothGranted) {
                                pendingPermissionIntent = PermissionRequestIntent.BluetoothConnection
                                pendingPermissionType = PermissionRequestType.Multiple
                                bluetoothPermission.launch(arrayOf(Manifest.permission.BLUETOOTH_CONNECT))
                            } else scope.launch { runCatching { soundpeats.connect() }.onFailure { viewModel.reportError(it.message.orEmpty()) } }
                        },
                        onRequestMicrophonePermission = {
                            startSpeechAfterPermission = false
                            pendingPermissionIntent = PermissionRequestIntent.AmbientMonitoring
                            pendingPermissionType = PermissionRequestType.Single
                            microphonePermission.launch(Manifest.permission.RECORD_AUDIO)
                        },
                        onRequestBluetoothPermission = {
                            if (!preferences.bluetoothAccess) viewModel.reportError("Enable Bluetooth access in Privacy settings.")
                            else if (Build.VERSION.SDK_INT >= 31) {
                                pendingPermissionIntent = PermissionRequestIntent.BluetoothConnection
                                pendingPermissionType = PermissionRequestType.Multiple
                                bluetoothPermission.launch(arrayOf(Manifest.permission.BLUETOOTH_CONNECT))
                            }
                        },
                        soundPeatsName = (headphoneState as? SoundpeatsController.ConnectionState.Connected)?.device?.name ?: "SoundPeats Mini Pro HS",
                        onCalibrationStarted = { calibrationNoise.start() },
                        onCalibrationStopped = calibrationNoise::stop,
                    )
                    MainPage.Notifications -> NotificationFeedScreen(
                        notifications = state.notifications,
                        selectedFilter = notificationFilter,
                        onFilterSelected = { notificationFilter = it },
                        onMarkRead = viewModel::markRead,
                        onDelete = viewModel::deleteNotification,
                        onMarkAllRead = viewModel::markAllRead,
                        onBack = { page = MainPage.Dashboard },
                    )
                    MainPage.Settings -> SettingsScreen(
                        profile = ProfileState(state.user?.displayName.orEmpty(), state.user?.email.orEmpty()),
                        preferences = settingsPreferences,
                        selectedTab = settingsTab,
                        isEditingProfile = editingProfile,
                        editedName = editedName,
                        editedEmail = state.user?.email.orEmpty(),
                        onTabSelected = { settingsTab = it },
                        onEditProfile = { editingProfile = true },
                        onEditedNameChange = { editedName = it },
                        onEditedEmailChange = {},
                        onSaveProfile = { if (editedName.isNotBlank()) viewModel.updateName(editedName) { editingProfile = false } },
                        onCancelEditProfile = { editingProfile = false },
                        onPreferenceChange = { mutation ->
                            val booleanMutation = mutation as? PreferenceMutation.BooleanValue
                            val field = booleanMutation?.field
                            val requiresRuntimePermission = field == PreferenceField.LocationAccess ||
                                field == PreferenceField.MicrophoneAccess ||
                                field == PreferenceField.CameraAccess ||
                                field == PreferenceField.BluetoothAccess ||
                                field == PreferenceField.PushNotifications
                            if (booleanMutation != null && booleanMutation.value && requiresRuntimePermission && !preferencePermissionGranted(field!!)) {
                                if (field == PreferenceField.PushNotifications) {
                                    pendingPermissionIntent = PermissionRequestIntent.NotificationToggle
                                    pendingPermissionType = PermissionRequestType.Single
                                    pendingPermissionValue = true
                                    notificationPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
                                } else {
                                    pendingPermissionIntent = PermissionRequestIntent.PreferenceToggle
                                    pendingPermissionType = PermissionRequestType.Multiple
                                    pendingPreferenceFieldName = field.name
                                    pendingPermissionValue = booleanMutation.value
                                    val permissions = when (field) {
                                        PreferenceField.LocationAccess -> arrayOf(
                                            Manifest.permission.ACCESS_FINE_LOCATION,
                                            Manifest.permission.ACCESS_COARSE_LOCATION,
                                        )
                                        PreferenceField.MicrophoneAccess -> arrayOf(Manifest.permission.RECORD_AUDIO)
                                        PreferenceField.CameraAccess -> arrayOf(Manifest.permission.CAMERA)
                                        PreferenceField.BluetoothAccess -> arrayOf(Manifest.permission.BLUETOOTH_CONNECT)
                                        else -> emptyArray()
                                    }
                                    preferencePermission.launch(permissions)
                                }
                            } else {
                                val effectiveMutation = if (mutation is PreferenceMutation.BooleanValue &&
                                    mutation.field == PreferenceField.PushNotifications && !mutation.value
                                ) {
                                    PreferenceMutation.Compound(
                                        listOf(
                                            mutation,
                                            PreferenceMutation.BooleanValue(PreferenceField.ThresholdAlerts, false),
                                            PreferenceMutation.BooleanValue(PreferenceField.DailySummary, false),
                                        ),
                                    )
                                } else mutation
                                applyPreferenceMutation(effectiveMutation)
                            }
                        },
                        onOpenNotifications = { page = MainPage.Notifications },
                        onResetPassword = { state.user?.email?.let { viewModel.forgotPassword(it) {} } },
                        onLogout = viewModel::logout,
                        onDownloadData = { Toast.makeText(context, "Your data export is being prepared.", Toast.LENGTH_LONG).show() },
                        onClearData = { viewModel.clearUserData() },
                        onBack = { page = MainPage.Dashboard },
                    )
                }
                state.error?.let { ErrorMessage(it, Modifier.align(Alignment.BottomCenter).padding(16.dp)) }
            }
        }
    }
}

@Composable
private fun RowScope.MainTab(page: MainPage, selected: MainPage, label: String, icon: androidx.compose.ui.graphics.vector.ImageVector, onSelect: (MainPage) -> Unit) {
    NavigationBarItem(
        selected = page == selected,
        onClick = { onSelect(page) },
        icon = { Icon(icon, label) },
        label = { Text(label) },
    )
}

@Composable
private fun CenteredLoading() = Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }

private fun greeting(): String = when (java.time.LocalTime.now().hour) {
    in 5..11 -> "Good morning"
    in 12..17 -> "Good afternoon"
    else -> "Good evening"
}

private fun soundUrl(sound: String): String = when (sound) {
    "rain" -> "https://archive.org/download/jamendo-082208/01.mp3"
    "river" -> "https://archive.org/download/jamendo-082208/02.mp3"
    else -> "https://archive.org/download/jamendo-082208/03.mp3"
}

private fun captureTargetFor(context: android.content.Context, uriString: String): CameraTempUriHelper.CaptureTarget? {
    val uri = runCatching { Uri.parse(uriString) }.getOrNull() ?: return null
    val fileName = uri.lastPathSegment?.takeIf { it.startsWith("capture-") && it.endsWith(".jpg") } ?: return null
    return CameraTempUriHelper.CaptureTarget(
        uri = uri,
        file = File(File(context.cacheDir, "camera"), fileName),
    )
}

private fun readRuntimePermissions(context: android.content.Context): RuntimePermissionState = RuntimePermissionState(
    locationGranted = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
        ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED,
    microphoneGranted = ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED,
    cameraGranted = ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED,
    bluetoothGranted = Build.VERSION.SDK_INT < 31 ||
        ContextCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED,
    notificationsGranted = Build.VERSION.SDK_INT < 33 ||
        ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED,
)

private fun openEmail(context: android.content.Context) {
    val gmail = Intent(Intent.ACTION_MAIN).apply { setPackage("com.google.android.gm"); addCategory(Intent.CATEGORY_APP_EMAIL) }
    runCatching { context.startActivity(gmail) }.recoverCatching {
        context.startActivity(Intent(Intent.ACTION_SENDTO, Uri.parse("mailto:")))
    }
}
