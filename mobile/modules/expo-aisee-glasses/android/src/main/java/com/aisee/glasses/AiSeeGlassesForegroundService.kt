package com.aisee.glasses

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.location.Location
import android.location.LocationManager
import android.os.Build
import android.os.IBinder
import android.util.Log
import android.widget.Toast
import androidx.core.app.NotificationCompat
import com.aisee.glasses.core.AiseeError
import com.aisee.glasses.core.AiseeGlassesController
import com.aisee.glasses.core.AiseeListener
import com.aisee.glasses.core.ConnectionState
import com.aisee.glasses.core.MemorySaver

/**
 * Android Foreground Service that keeps the AiSee glasses Bluetooth connection
 * alive even when the app is backgrounded or killed from the recents tray.
 *
 * The full pipeline runs natively:
 *   Button press → Photo capture → Beep → Voice recording → Gemini transcription
 *   → GPS lookup → POST to NeuroNudge backend
 */
class AiSeeGlassesForegroundService : Service() {

    companion object {
        private const val TAG = "AiSeeGlassesFgSvc"
        const val CHANNEL_ID = "aisee_glasses_channel"
        const val NOTIFICATION_ID = 9901

        const val ACTION_START = "com.aisee.glasses.ACTION_START"
        const val ACTION_STOP = "com.aisee.glasses.ACTION_STOP"
        const val ACTION_UPDATE_TOKEN = "com.aisee.glasses.ACTION_UPDATE_TOKEN"

        const val EXTRA_MAC_ADDRESS = "mac_address"
        const val EXTRA_API_KEY = "api_key"
        const val EXTRA_AUTH_TOKEN = "auth_token"
        const val EXTRA_BASE_URL = "base_url"

        @Volatile
        var isRunning = false
            private set

        @Volatile
        var currentConnectionState: String = "DISCONNECTED"
            private set
    }

    private var controller: AiseeGlassesController? = null
    private var authToken: String = ""
    private var baseUrl: String = ""
    private var lastCapturedImagePath: String? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                val macAddress = intent.getStringExtra(EXTRA_MAC_ADDRESS) ?: return START_NOT_STICKY
                val apiKey = intent.getStringExtra(EXTRA_API_KEY) ?: return START_NOT_STICKY
                authToken = intent.getStringExtra(EXTRA_AUTH_TOKEN) ?: ""
                baseUrl = intent.getStringExtra(EXTRA_BASE_URL) ?: ""

                startForeground(NOTIFICATION_ID, buildNotification("Connecting to glasses..."))
                isRunning = true

                initAndConnect(macAddress, apiKey)
            }
            ACTION_STOP -> {
                stopSelf()
            }
            ACTION_UPDATE_TOKEN -> {
                authToken = intent.getStringExtra(EXTRA_AUTH_TOKEN) ?: authToken
            }
        }

        return START_STICKY
    }

    private var currentMacAddress: String? = null

    override fun onDestroy() {
        super.onDestroy()
        try {
            controller?.disconnect()
        } catch (e: Exception) {
            Log.e(TAG, "Error disconnecting on destroy", e)
        }
        controller = null
        currentMacAddress = null
        isRunning = false
        currentConnectionState = "DISCONNECTED"
    }

    private fun initAndConnect(macAddress: String, apiKey: String) {
        if (controller != null && currentMacAddress == macAddress &&
            (currentConnectionState == "CONNECTED" || currentConnectionState == "READY" || currentConnectionState == "CONNECTING")) {
            Log.d(TAG, "Service already connected or connecting to $macAddress, skipping duplicate init")
            return
        }

        try {
            controller?.disconnect()
        } catch (e: Exception) {
            Log.w(TAG, "Error disconnecting previous controller", e)
        }
        controller = null
        currentMacAddress = macAddress

        controller = AiseeGlassesController(applicationContext, apiKey, object : AiseeListener {
            override fun onConnectionState(state: ConnectionState) {
                currentConnectionState = state.name
                Log.d(TAG, "Connection state: ${state.name}")

                val notifText = when (state) {
                    ConnectionState.CONNECTING -> "Connecting to glasses..."
                    ConnectionState.CONNECTED -> "Glasses connected, initializing..."
                    ConnectionState.READY -> "AiSee Glasses — Ready"
                    ConnectionState.DISCONNECTED -> "Glasses disconnected"
                    ConnectionState.ERROR -> "Connection error"
                    else -> "AiSee Glasses — ${state.name}"
                }
                updateNotification(notifText)

                // Emit event to JS if bridge is available
                try {
                    val reactContext = AISeeGlassesModuleRegistry.reactContext
                    reactContext?.getJSModule(com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        ?.emit("onConnectionStateChanged", com.facebook.react.bridge.Arguments.createMap().apply {
                            putString("state", state.name)
                        })
                } catch (e: Exception) {
                    // JS bridge not available (app backgrounded) — that's fine
                }
            }

            override fun onPhotoCaptured(uri: android.net.Uri, path: String) {
                Log.d(TAG, "Photo captured: $path")
                lastCapturedImagePath = path

                // Emit event to JS if bridge is available
                try {
                    val reactContext = AISeeGlassesModuleRegistry.reactContext
                    reactContext?.getJSModule(com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        ?.emit("onImageCaptured", com.facebook.react.bridge.Arguments.createMap().apply {
                            putString("path", path)
                        })
                } catch (e: Exception) {
                    // JS bridge not available
                }
            }

            override fun onTranscript(text: String, isFinal: Boolean) {
                Log.d(TAG, "Transcript (isFinal=$isFinal): $text")

                // Emit event to JS
                try {
                    val reactContext = AISeeGlassesModuleRegistry.reactContext
                    reactContext?.getJSModule(com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        ?.emit("onTranscript", com.facebook.react.bridge.Arguments.createMap().apply {
                            putString("text", text)
                            putBoolean("isFinal", isFinal)
                        })
                } catch (e: Exception) {
                    // JS bridge not available
                }

                if (isFinal && text.isNotBlank()) {
                    saveMemory(text)
                }
            }

            override fun onTriggerDetected(sentence: String) {
                // Not used in this flow
            }

            override fun onAudioSaved(path: String) {
                Log.d(TAG, "Audio saved: $path")

                try {
                    val reactContext = AISeeGlassesModuleRegistry.reactContext
                    reactContext?.getJSModule(com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        ?.emit("onAudioSaved", com.facebook.react.bridge.Arguments.createMap().apply {
                            putString("path", path)
                        })
                } catch (e: Exception) {
                    // JS bridge not available
                }
            }

            override fun onButtonPressed() {
                Log.d(TAG, "Button pressed on glasses")
                updateNotification("Capturing photo...")

                try {
                    val reactContext = AISeeGlassesModuleRegistry.reactContext
                    reactContext?.getJSModule(com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        ?.emit("onButtonPressed", com.facebook.react.bridge.Arguments.createMap())
                } catch (e: Exception) {
                    // JS bridge not available
                }
            }

            override fun onError(error: AiseeError, message: String?) {
                Log.e(TAG, "AiSee error: ${error.name} — $message")
                updateNotification("AiSee Glasses — Ready")
            }
        })

        controller?.connect(macAddress)
    }

    /**
     * Grabs GPS coordinates from the phone and POSTs the memory to the backend.
     */
    private fun saveMemory(transcript: String) {
        updateNotification("Saving memory...")

        // Get location
        var latitude: Double? = null
        var longitude: Double? = null

        try {
            val locationManager = getSystemService(Context.LOCATION_SERVICE) as LocationManager
            val location: Location? = try {
                locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER)
                    ?: locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
            } catch (e: SecurityException) {
                Log.w(TAG, "Location permission not granted", e)
                null
            }

            if (location != null) {
                latitude = location.latitude
                longitude = location.longitude
            }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to get location", e)
        }

        val imageFile = lastCapturedImagePath?.let { java.io.File(it) }
        lastCapturedImagePath = null

        val userText = "I placed $transcript"

        val payload = MemorySaver.MemoryPayload(
            userText = userText,
            imageFile = imageFile,
            latitude = latitude,
            longitude = longitude,
            authToken = authToken,
            baseUrl = baseUrl,
        )

        MemorySaver.save(payload) { result ->
            if (result.success) {
                Log.i(TAG, "Memory saved: ${result.reply}")
                updateNotification("AiSee Glasses — Ready")
                showToast("Memory saved via Glasses")

                // Emit completion event to JS
                try {
                    val reactContext = AISeeGlassesModuleRegistry.reactContext
                    reactContext?.getJSModule(com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        ?.emit("onMemorySaved", com.facebook.react.bridge.Arguments.createMap().apply {
                            putString("reply", result.reply ?: "Memory saved")
                        })
                } catch (e: Exception) {
                    // JS bridge not available
                }
            } else {
                Log.e(TAG, "Failed to save memory: ${result.error}")
                updateNotification("AiSee Glasses — Ready")
                showToast("Glasses capture failed. Please try again.")
            }
        }
    }

    private fun showToast(message: String) {
        android.os.Handler(mainLooper).post {
            Toast.makeText(applicationContext, message, Toast.LENGTH_SHORT).show()
        }
    }

    // ─── Notification Helpers ───────────────────────────────────────────────

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "AiSee Glasses",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps the AiSee glasses connection alive in the background"
                setShowBadge(false)
            }

            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(contentText: String): Notification {
        // Tapping the notification opens the app
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Stop action
        val stopIntent = Intent(this, AiSeeGlassesForegroundService::class.java).apply {
            action = ACTION_STOP
        }
        val stopPendingIntent = PendingIntent.getService(
            this, 1, stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("NeuroNudge")
            .setContentText(contentText)
            .setSmallIcon(android.R.drawable.ic_menu_camera)
            .setContentIntent(pendingIntent)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Disconnect", stopPendingIntent)
            .setOngoing(true)
            .setSilent(true)
            .build()
    }

    private fun updateNotification(contentText: String) {
        try {
            val manager = getSystemService(NotificationManager::class.java)
            manager.notify(NOTIFICATION_ID, buildNotification(contentText))
        } catch (e: Exception) {
            Log.e(TAG, "Failed to update notification", e)
        }
    }
}

/**
 * Simple registry to share the React context with the foreground service.
 * The Expo module sets this when it initializes.
 */
object AISeeGlassesModuleRegistry {
    @Volatile
    var reactContext: com.facebook.react.bridge.ReactContext? = null
}
