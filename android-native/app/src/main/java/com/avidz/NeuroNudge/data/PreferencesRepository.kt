package com.avidz.NeuroNudge.data

import android.content.Context
import androidx.datastore.preferences.core.MutablePreferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore("neuronudge_preferences")

data class AppPreferences(
    val darkMode: Boolean = false,
    val ambientEnabled: Boolean = true,
    val threshold: Int = 65,
    val sustainSeconds: Int = 2,
    val thresholdAction: String = "none",
    val natureSound: String = "ocean",
    val thresholdAlerts: Boolean = true,
    val dailySummary: Boolean = false,
    val pushNotifications: Boolean = true,
    val locationAccess: Boolean = true,
    val microphoneAccess: Boolean = true,
    val cameraAccess: Boolean = false,
    val bluetoothAccess: Boolean = false,
    val shareUsageData: Boolean = false,
    val personalizedInsights: Boolean = true,
)

class PreferencesRepository(private val context: Context) {
    object Keys {
        val Theme = stringPreferencesKey("neuronudge_theme_mode")
        val Ambient = booleanPreferencesKey("ambient_noise_enabled")
        val Threshold = intPreferencesKey("sanctuary_threshold")
        val Sustain = intPreferencesKey("sanctuary_sustain")
        val Action = stringPreferencesKey("sanctuary_action")
        val Sound = stringPreferencesKey("sanctuary_sound")
        val ThresholdAlerts = booleanPreferencesKey("alerts_threshold")
        val Daily = booleanPreferencesKey("alerts_daily_summary")
        val Push = booleanPreferencesKey("alerts_push_notifications")
        val Location = booleanPreferencesKey("privacy_location_access")
        val Microphone = booleanPreferencesKey("privacy_microphone_access")
        val Camera = booleanPreferencesKey("privacy_camera_access")
        val Bluetooth = booleanPreferencesKey("privacy_bluetooth_access")
        val Usage = booleanPreferencesKey("privacy_share_usage_data")
        val Insights = booleanPreferencesKey("privacy_personalized_insights")
    }

    val values: Flow<AppPreferences> = context.dataStore.data.map { p ->
        AppPreferences(
            darkMode = p[Keys.Theme] == "dark",
            ambientEnabled = p[Keys.Ambient] ?: true,
            threshold = p[Keys.Threshold] ?: 65,
            sustainSeconds = p[Keys.Sustain] ?: 2,
            thresholdAction = p[Keys.Action] ?: "none",
            natureSound = p[Keys.Sound] ?: "ocean",
            thresholdAlerts = p[Keys.ThresholdAlerts] ?: true,
            dailySummary = p[Keys.Daily] ?: false,
            pushNotifications = p[Keys.Push] ?: true,
            locationAccess = p[Keys.Location] ?: true,
            microphoneAccess = p[Keys.Microphone] ?: true,
            cameraAccess = p[Keys.Camera] ?: false,
            bluetoothAccess = p[Keys.Bluetooth] ?: false,
            shareUsageData = p[Keys.Usage] ?: false,
            personalizedInsights = p[Keys.Insights] ?: true,
        )
    }

    /** Apply a typed field mutation to the current DataStore state in one transaction. */
    suspend fun update(mutation: PreferenceMutation) = context.dataStore.edit { preferences ->
        preferences.applyMutation(mutation)
    }

    private fun MutablePreferences.applyMutation(mutation: PreferenceMutation) {
        when (mutation) {
            is PreferenceMutation.Compound -> mutation.changes.forEach { applyMutation(it) }
            is PreferenceMutation.BooleanValue -> when (mutation.field) {
                PreferenceField.DarkMode -> this[Keys.Theme] = if (mutation.value) "dark" else "light"
                PreferenceField.AmbientEnabled -> this[Keys.Ambient] = mutation.value
                PreferenceField.ThresholdAlerts -> this[Keys.ThresholdAlerts] = mutation.value
                PreferenceField.DailySummary -> this[Keys.Daily] = mutation.value
                PreferenceField.PushNotifications -> this[Keys.Push] = mutation.value
                PreferenceField.LocationAccess -> this[Keys.Location] = mutation.value
                PreferenceField.MicrophoneAccess -> this[Keys.Microphone] = mutation.value
                PreferenceField.CameraAccess -> this[Keys.Camera] = mutation.value
                PreferenceField.BluetoothAccess -> this[Keys.Bluetooth] = mutation.value
                PreferenceField.ShareUsageData -> this[Keys.Usage] = mutation.value
                PreferenceField.PersonalizedInsights -> this[Keys.Insights] = mutation.value
                else -> Unit
            }
            is PreferenceMutation.IntValue -> when (mutation.field) {
                PreferenceField.Threshold -> this[Keys.Threshold] = mutation.value
                PreferenceField.SustainSeconds -> this[Keys.Sustain] = mutation.value
                else -> Unit
            }
            is PreferenceMutation.StringValue -> when (mutation.field) {
                PreferenceField.ThresholdAction -> this[Keys.Action] = mutation.value
                PreferenceField.NatureSound -> this[Keys.Sound] = mutation.value
                else -> Unit
            }
        }
    }

    suspend fun clear() = context.dataStore.edit { it.clear() }
}
