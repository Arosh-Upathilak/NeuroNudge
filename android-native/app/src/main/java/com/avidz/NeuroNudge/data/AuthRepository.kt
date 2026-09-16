package com.avidz.NeuroNudge.data

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.auth.UserProfileChangeRequest
import kotlinx.coroutines.tasks.await

class AuthRepository(private val api: ApiRepository) {
    val firebase: FirebaseAuth = FirebaseAuth.getInstance()

    suspend fun login(email: String, password: String) {
        val user = firebase.signInWithEmailAndPassword(email.trim(), password).await().user
            ?: error("Sign-in failed.")
        if (user.isEmailVerified) api.syncUser(user.uid)
    }

    suspend fun signup(name: String, email: String, password: String) {
        val user = firebase.createUserWithEmailAndPassword(email.trim(), password).await().user
            ?: error("Account creation failed.")
        try {
            requireCurrentUser(user.uid)
            user.updateProfile(UserProfileChangeRequest.Builder().setDisplayName(name.trim()).build()).await()
            requireCurrentUser(user.uid)
            api.syncUser(user.uid)
            api.sendVerification(user.uid)
        } catch (error: Throwable) {
            if (firebase.currentUser?.uid == user.uid) runCatching { user.delete().await() }
            throw error
        }
    }

    suspend fun loginWithGoogle(idToken: String) {
        val user = firebase.signInWithCredential(GoogleAuthProvider.getCredential(idToken, null)).await().user
            ?: error("Google sign-in failed.")
        try {
            api.syncUser(user.uid)
        } catch (error: Throwable) {
            if (firebase.currentUser?.uid == user.uid) firebase.signOut()
            throw error
        }
    }

    suspend fun reload(expectedUid: String): Boolean {
        val user = requireCurrentUser(expectedUid)
        requireCurrentUser(expectedUid)
        user.reload().await()
        val current = requireCurrentUser(expectedUid)
        val verified = current.isEmailVerified
        if (verified) api.syncUser(expectedUid)
        return verified
    }

    suspend fun resendVerification(expectedUid: String) {
        requireCurrentUser(expectedUid)
        api.sendVerification(expectedUid)
    }
    suspend fun forgotPassword(email: String) = api.forgotPassword(email.trim())

    suspend fun updateName(expectedUid: String, name: String) {
        val user = requireCurrentUser(expectedUid)
        requireCurrentUser(expectedUid)
        user.updateProfile(UserProfileChangeRequest.Builder().setDisplayName(name.trim()).build()).await()
        requireCurrentUser(expectedUid)
        api.syncUser(expectedUid)
    }

    fun logout() = firebase.signOut()

    private fun requireCurrentUser(expectedUid: String) =
        firebase.currentUser?.takeIf { it.uid == expectedUid } ?: error("The signed-in account changed.")
}
