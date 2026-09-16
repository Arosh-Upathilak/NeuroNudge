package com.avidz.NeuroNudge.data

import android.content.Context
import android.net.Uri
import com.avidz.NeuroNudge.BuildConfig
import com.google.firebase.auth.FirebaseAuth
import com.google.gson.Gson
import com.google.gson.JsonParser
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.io.File
import java.util.UUID

internal const val MAX_CHAT_IMAGE_BYTES = 10L * 1024L * 1024L

class ApiRepository(private val context: Context) {
    private val gson = Gson()
    private val service: ApiService = Retrofit.Builder()
        .baseUrl(BuildConfig.API_BASE_URL)
        .client(OkHttpClient.Builder().apply {
            if (BuildConfig.DEBUG) addInterceptor(HttpLoggingInterceptor().setLevel(HttpLoggingInterceptor.Level.BASIC))
        }.build())
        .addConverterFactory(GsonConverterFactory.create(gson))
        .build()
        .create(ApiService::class.java)

    private suspend fun <T> authenticated(expectedUid: String, dispatch: suspend (String) -> T): T {
        val user = FirebaseAuth.getInstance().currentUser ?: error("You are signed out.")
        require(user.uid == expectedUid) { "The signed-in account changed." }
        val token = user.getIdToken(true).await().token ?: error("Unable to authenticate request.")

        // Keep the captured user and expected UID bound through the final check directly
        // before Retrofit dispatches the request.
        check(user.uid == expectedUid && FirebaseAuth.getInstance().currentUser?.uid == expectedUid) {
            "The signed-in account changed."
        }
        return dispatch("Bearer $token")
    }

    suspend fun syncUser(expectedUid: String): ApiUser = authenticated(expectedUid) { bearer ->
        service.syncUser(bearer).let {
            it.user ?: error(it.error?.message ?: it.message ?: "Synchronization failed.")
        }
    }

    suspend fun sendVerification(expectedUid: String) {
        val result = authenticated(expectedUid) { bearer -> service.sendVerification(bearer) }
        if (!result.success) error(result.error?.message ?: "Failed to send verification email.")
    }

    suspend fun forgotPassword(email: String) {
        val result = service.forgotPassword(ResetRequest(email))
        if (!result.success) error(result.error?.message ?: "Failed to request password reset.")
    }

    suspend fun clearData(expectedUid: String) {
        val result = authenticated(expectedUid) { bearer -> service.clearData(bearer) }
        if (!result.success) error(result.error?.message ?: "Failed to clear user data.")
    }

    suspend fun memories(expectedUid: String): List<ApiMemory> = authenticated(expectedUid) { bearer -> service.memories(bearer) }.let {
        if (it.success) it.data.orEmpty() else error(it.error?.message ?: it.message ?: "Failed to fetch memories.")
    }

    suspend fun messages(expectedUid: String): List<ApiMessage> = authenticated(expectedUid) { bearer -> service.messages(bearer) }.let {
        if (it.success) it.data.orEmpty() else error(it.error?.message ?: it.message ?: "Failed to fetch messages.")
    }

    suspend fun chat(expectedUid: String, text: String, latitude: Double?, longitude: Double?, imageUri: Uri?): NlpChatResponse {
        val normalizedText = requiredChatText(text) ?: error("Message text is required.")
        return withContext(Dispatchers.IO) {
            val plain = "text/plain".toMediaType()
            var uploadCopy: File? = null
            try {
                val image = imageUri?.let { uri ->
                    val file = File(context.cacheDir, "photo_${UUID.randomUUID()}.jpg")
                    uploadCopy = file
                    copyImageToUploadFile(uri, file)
                    MultipartBody.Part.createFormData(
                        "image",
                        file.name,
                        file.asRequestBody("image/jpeg".toMediaType()),
                    )
                }
                val result = authenticated(expectedUid) { bearer -> service.chat(
                    bearer,
                    normalizedText.toRequestBody(plain),
                    latitude?.toString()?.toRequestBody(plain),
                    longitude?.toString()?.toRequestBody(plain),
                    image,
                ) }
                if (result.success) result.data ?: error("Empty chat response.")
                else error(result.error?.message ?: result.message ?: "Failed to process chat message.")
            } finally {
                uploadCopy?.let { file -> if (file.exists()) file.delete() }
            }
        }
    }

    private fun copyImageToUploadFile(uri: Uri, destination: File) {
        val source = context.contentResolver.openInputStream(uri) ?: error("Unable to read selected image.")
        source.use { input ->
            destination.outputStream().use { output ->
                val buffer = ByteArray(DEFAULT_BUFFER_SIZE)
                var copied = 0L
                while (true) {
                    val remaining = MAX_CHAT_IMAGE_BYTES - copied
                    val read = input.read(buffer, 0, minOf(buffer.size.toLong(), remaining + 1L).toInt())
                    if (read < 0) break
                    if (read > remaining) error("Image is too large. Please choose an image under 10 MB.")
                    output.write(buffer, 0, read)
                    copied += read
                }
            }
        }
    }

    fun decodeAssistant(message: ApiMessage): ChatItem {
        val parsed = runCatching {
            message.aiContent?.takeIf { JsonParser.parseString(it).isJsonObject }?.let {
                gson.fromJson(it, NlpChatResponse::class.java)
            }
        }.getOrNull()
        return ChatItem(message.messageId, false, parsed?.reply ?: message.content, parsed?.memories.orEmpty())
    }
}
