package com.aisee.glasses

import android.content.Intent
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import com.aisee.glasses.core.AiseeGlassesController
import com.aisee.glasses.core.AiseeListener
import android.util.Log

class AISeeGlassesModule : Module() {
  private var controller: AiseeGlassesController? = null
  private val TAG = "AISeeGlassesModule"

  override fun definition() = ModuleDefinition {
    Name("AISeeGlasses")
    
    Events("onConnectionStateChanged", "onTranscript", "onImageCaptured", "onAudioSaved", "onButtonPressed", "onMemorySaved")

    OnCreate {
      // Share the React context with the foreground service registry
      val reactContext = appContext.reactContext
      if (reactContext is com.facebook.react.bridge.ReactContext) {
        AISeeGlassesModuleRegistry.reactContext = reactContext
      }
    }

    Function("init") { apiKey: String ->
      val context = appContext.reactContext
      if (context != null) {
        controller = AiseeGlassesController(context, apiKey, object : AiseeListener {
          override fun onConnectionState(state: com.aisee.glasses.core.ConnectionState) {
            sendEvent("onConnectionStateChanged", mapOf("state" to state.name))
          }

          override fun onPhotoCaptured(uri: android.net.Uri, path: String) {
            sendEvent("onImageCaptured", mapOf("path" to path))
          }

          override fun onTranscript(text: String, isFinal: Boolean) {
            sendEvent("onTranscript", mapOf("text" to text, "isFinal" to isFinal))
          }

          override fun onAudioSaved(path: String) {
            sendEvent("onAudioSaved", mapOf("path" to path))
          }

          override fun onButtonPressed() {
            sendEvent("onButtonPressed", mapOf<String, Any>())
          }

          override fun onTriggerDetected(sentence: String) {
            // Not used via direct module
          }

          override fun onError(error: com.aisee.glasses.core.AiseeError, message: String?) {
            Log.e(TAG, "Error: ${error.name} — $message")
          }
        })
      }
    }

    Function("connect") { macAddress: String ->
      controller?.connect(macAddress)
    }

    Function("disconnect") {
      controller?.disconnect()
    }

    Function("startVoiceInput") {
      controller?.startVoiceInput()
    }

    Function("stopVoiceInput") {
      controller?.stopVoiceInput()
    }

    Function("snapPicture") {
      controller?.capturePhoto()
    }

    // ─── Foreground Service Methods ─────────────────────────────────────

    Function("startService") { macAddress: String, apiKey: String, authToken: String, baseUrl: String ->
      val context = appContext.reactContext
      if (context != null) {
        val intent = Intent(context, AiSeeGlassesForegroundService::class.java).apply {
          action = AiSeeGlassesForegroundService.ACTION_START
          putExtra(AiSeeGlassesForegroundService.EXTRA_MAC_ADDRESS, macAddress)
          putExtra(AiSeeGlassesForegroundService.EXTRA_API_KEY, apiKey)
          putExtra(AiSeeGlassesForegroundService.EXTRA_AUTH_TOKEN, authToken)
          putExtra(AiSeeGlassesForegroundService.EXTRA_BASE_URL, baseUrl)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          context.startForegroundService(intent)
        } else {
          context.startService(intent)
        }
      }
    }

    Function("stopService") {
      val context = appContext.reactContext
      if (context != null) {
        val intent = Intent(context, AiSeeGlassesForegroundService::class.java).apply {
          action = AiSeeGlassesForegroundService.ACTION_STOP
        }
        context.startService(intent)
      }
    }

    Function("updateAuthToken") { token: String ->
      val context = appContext.reactContext
      if (context != null) {
        val intent = Intent(context, AiSeeGlassesForegroundService::class.java).apply {
          action = AiSeeGlassesForegroundService.ACTION_UPDATE_TOKEN
          putExtra(AiSeeGlassesForegroundService.EXTRA_AUTH_TOKEN, token)
        }
        context.startService(intent)
      }
    }

    Function("isServiceRunning") {
      AiSeeGlassesForegroundService.isRunning
    }

    Function("getServiceConnectionState") {
      AiSeeGlassesForegroundService.currentConnectionState
    }
  }
}
