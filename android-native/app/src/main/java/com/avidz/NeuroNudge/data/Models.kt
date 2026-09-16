package com.avidz.NeuroNudge.data

data class ApiEnvelope<T>(val success: Boolean, val data: T? = null, val message: String? = null, val error: ApiError? = null)
data class ApiError(val code: String? = null, val message: String? = null)
data class UserEnvelope(val success: Boolean, val user: ApiUser? = null, val message: String? = null, val error: ApiError? = null)
data class ApiUser(val id: String, val email: String, val name: String?, val createdAt: String, val updatedAt: String)
data class ResetRequest(val email: String)

data class ApiMemory(
    val memoryId: String,
    val userId: String,
    val title: String,
    val description: String?,
    val createdAt: String,
    val image: MemoryImage?,
    val location: MemoryLocation?,
)

data class MemoryImage(val id: String, val imageUrl: String, val publicId: String?, val memoryId: String)
data class MemoryLocation(val id: String, val latitude: Double, val longitude: Double, val memoryId: String)
data class ApiMessage(val messageId: String, val userId: String, val role: String, val content: String, val aiContent: String?, val createdAt: String)

data class NlpChatResponse(
    val status: String? = null,
    val intent: String? = null,
    val reply: String,
    val memories: List<NlpMemory>? = null,
)

data class NlpMemory(
    val memoryId: String? = null,
    val title: String,
    val description: String? = null,
    val imageUrl: String? = null,
    val publicId: String? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val createdAt: String? = null,
    val createdat: String? = null,
)

data class ChatItem(
    val id: String,
    val fromUser: Boolean,
    val text: String,
    val memories: List<NlpMemory> = emptyList(),
    val pending: Boolean = false,
)

/** Returns the text accepted by the chat endpoint, or null for a rejected send. */
internal fun requiredChatText(text: String): String? = text.trim().takeIf { it.isNotEmpty() }

enum class PreferenceField {
    DarkMode,
    AmbientEnabled,
    Threshold,
    SustainSeconds,
    ThresholdAction,
    NatureSound,
    ThresholdAlerts,
    DailySummary,
    PushNotifications,
    LocationAccess,
    MicrophoneAccess,
    CameraAccess,
    BluetoothAccess,
    ShareUsageData,
    PersonalizedInsights,
}

sealed interface PreferenceMutation {
    data class BooleanValue(val field: PreferenceField, val value: Boolean) : PreferenceMutation
    data class IntValue(val field: PreferenceField, val value: Int) : PreferenceMutation
    data class StringValue(val field: PreferenceField, val value: String) : PreferenceMutation
    data class Compound(val changes: List<PreferenceMutation>) : PreferenceMutation
}
