package com.aisee.glasses.core

import android.content.Context
import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Handler
import android.os.Looper
import android.util.Log

import com.aisee.glasses.core.voice.VoiceStreamClient
import com.realsil.sdk.audioconnect.smartwear.SmartWearModelCallback
import com.realsil.sdk.audioconnect.smartwear.SmartWearModelProxy
import com.realsil.sdk.bbpro.core.transportlayer.Command
import com.realsil.sdk.bbpro.MultiPeripheralConnectionManager
import com.realsil.sdk.bbpro.PeripheralConnectionManager
import com.realsil.sdk.bbpro.core.peripheral.ConnectionParameters
import com.realsil.sdk.bbpro.core.peripheral.PeripheralParameters
import com.realsil.sdk.bbpro.vendor.VendorModelCallback
import com.realsil.sdk.core.RtkConfigure
import com.realsil.sdk.core.RtkCore
import com.realsil.sdk.dfu.RtkDfu
import com.realsil.sdk.support.RtkSupport
import java.io.ByteArrayOutputStream
import java.io.File
import java.nio.ByteBuffer
import java.nio.ByteOrder

/**
 * Main controller for AISee glasses interaction.
 *
 * Responsibilities:
 * - Initialize Realtek SDK
 * - Connect to glasses over Bluetooth SPP
 * - Fast Photo Capture via BT Live Streaming
 * - Play Beep sound
 * - Start microphone stream and feed PCM to on-device STT
 */
class AiseeGlassesController(
    private val context: Context,
    private val apiKey: String,
    private val listener: AiseeListener,
) {
    private val TAG = "AiseeGlassesController"
    private val handler = Handler(Looper.getMainLooper())

    private var connectionManager: MultiPeripheralConnectionManager? = null
    private var connection: PeripheralConnectionManager? = null
    private var client: com.realsil.sdk.audioconnect.smartwear.SmartWearModelClient? = null
    private var voiceStreamClient: VoiceStreamClient? = VoiceStreamClient(
        onPcmChunk = { _ -> },
        onSilenceDetected = {
            handler.post {
                stopVoiceInput()
            }
        }
    )

    @Volatile
    private var isStreaming = false
    private val videoBuffer = ByteArrayOutputStream()

    @Volatile
    private var isVoiceActive = false
    private var voiceStopRunnable: Runnable? = null

    /** True when connected */
    private var connected = false

    init {
        initializeSdk()
    }

    private fun initializeSdk() {
        try {
            val configure = RtkConfigure.Builder()
                .debugEnabled(true)
                .printLog(true)
                .logTag("AISeeTest")
                .build()
            RtkCore.initialize(context, configure)
            RtkDfu.initialize(context, true)
            RtkSupport.initialize(context, false)

            val beeParams = com.realsil.sdk.bbpro.BeeProParams.Builder()
                .syncDataWhenConnected(true)
                .connectA2dp(true)
                .listenHfp(true)
                .build()
            connectionManager = MultiPeripheralConnectionManager.getInstance(context).apply {
                initialize(beeParams)
            }
            SmartWearModelProxy.initialize(context)
        } catch (e: Exception) {
            listener.onError(AiseeError.NOT_INITIALIZED, e.message)
        }
    }

    /** Connects to the glasses using the provided MAC address. */
    fun connect(macAddress: String) {
        if (connected) {
            listener.onError(AiseeError.CONNECTION_FAILED, "Already connected")
            return
        }

        listener.onConnectionState(ConnectionState.CONNECTING)

        try {
            val manager = connectionManager ?: throw Exception("Connection manager not initialized")
            connection = manager.getPeripheralConnectionManager(macAddress)
            connection?.registerVendorModelCallback(vendorCallback)

            val peripheralParams = PeripheralParameters.Builder()
                .syncDataWhenConnected(true)
                .connectA2dp(true)
                .listenHfp(true)
                .build()

            val connectParams = ConnectionParameters.Builder(macAddress)
                .channelType(ConnectionParameters.CHANNEL_TYPE_SPP)
                .peripheralParameters(peripheralParams)
                .build()

            connection?.startConnect(connectParams)
        } catch (e: Exception) {
            listener.onError(AiseeError.CONNECTION_FAILED, e.message)
            listener.onConnectionState(ConnectionState.ERROR)
        }
    }

    /** Triggers the interactive workflow: Picture -> Beep -> Voice Record */
    fun capturePhoto() {
        if (isStreaming) {
            Log.d(TAG, "capturePhoto: already streaming, ignoring")
            return
        }
        
        // Ensure voice is stopped before starting stream
        stopVoiceInput()

        Log.d(TAG, "capturePhoto: starting BT live streaming")
        videoBuffer.reset()
        isStreaming = true

        // Payload for 720p 10fps: <BBhhIIhhBB (32 bytes total padding)
        val payload = ByteBuffer.allocate(32)
        payload.order(ByteOrder.LITTLE_ENDIAN)
        payload.put(1) // type
        payload.put(5) // attr
        payload.putShort(1280) // width
        payload.putShort(720) // height
        payload.putInt(10) // fps
        payload.putInt(500000) // bps
        payload.putShort(0)
        payload.putShort(0)
        payload.put(0)
        payload.put(1)

        val cmd = Command.Builder()
            .writeType(2)
            .packet(33849, payload.array()) // 0x8439 START_LIVE_STREAMING
            .eventId(33849)
            .build()
        client?.sendVendorCommand(cmd)

        // Stream for 2.5 seconds then stop and process
        handler.postDelayed({
            if (isStreaming) {
                stopStreamingAndProcess()
            }
        }, 2500)
    }

    private fun stopStreamingAndProcess() {
        Log.d(TAG, "Stopping BT stream and processing frame")
        isStreaming = false
        val cmd = Command.Builder()
            .writeType(2)
            .packet(33850, ByteArray(0)) // 0x843A STOP_LIVE_STREAMING
            .eventId(33850)
            .build()
        client?.sendVendorCommand(cmd)

        val h264Data = videoBuffer.toByteArray()
        Log.d(TAG, "Captured ${h264Data.size} bytes of H264")

        if (h264Data.isNotEmpty()) {
            Thread {
                val bitmap = H264Decoder.decodeFrame(h264Data)
                if (bitmap != null) {
                    saveBitmapToPictures(bitmap)
                    
                    // Sequence: Play beep, wait, start voice
                    playBeep()
                    handler.postDelayed({
                        startVoiceInput()
                    }, 500)
                } else {
                    Log.e(TAG, "Failed to decode H264 frame")
                }
            }.start()
        }
    }

    private fun playBeep() {
        try {
            val toneG = ToneGenerator(AudioManager.STREAM_MUSIC, 100)
            toneG.startTone(ToneGenerator.TONE_PROP_BEEP, 200)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to play beep", e)
        }
    }

    /** Starts voice input from the glasses microphone for 7 seconds. */
    fun startVoiceInput() {
        if (isVoiceActive) return
        isVoiceActive = true
        voiceStreamClient?.resetVAD()
        client?.startUserVoiceInput(0x00)

        voiceStopRunnable = Runnable {
            stopVoiceInput()
        }
        // 20-second maximum safety timeout
        handler.postDelayed(voiceStopRunnable!!, 20000)
    }

    /** Stops voice input from the glasses microphone. */
    fun stopVoiceInput() {
        if (voiceStopRunnable != null) {
            handler.removeCallbacks(voiceStopRunnable!!)
            voiceStopRunnable = null
        }
        if (isVoiceActive) {
            isVoiceActive = false
            client?.stopUserVoiceInput()
            val audioFile = voiceStreamClient?.saveToWav(context)
            if (audioFile != null) {
                handler.post {
                    listener.onAudioSaved(audioFile.absolutePath)
                }
                
                // Transcribe with Gemini
                com.aisee.glasses.core.voice.GeminiSttClient.transcribeWav(audioFile, apiKey) { text ->
                    if (text != null) {
                        handler.post {
                            listener.onTranscript(text, true)
                        }
                    } else {
                        Log.e(TAG, "Gemini transcription failed.")
                    }
                }
            }
        }
    }

    /** Disconnects from the glasses. */
    fun disconnect() {
        try {
            stopVoiceInput()
            connection?.disconnect()
        } catch (e: Exception) {
            Log.e(TAG, "Disconnect failed: ${e.message}")
        } finally {
            connected = false
            listener.onConnectionState(ConnectionState.DISCONNECTED)
        }
    }

    /** Left empty since STT is now handled by Gemini in the cloud. */
    fun initStt(modelPath: String) {
        // No-op
    }

    /** Saves decoded bitmap to the app's Pictures/AISeeTest directory. */
    private fun saveBitmapToPictures(bitmap: android.graphics.Bitmap) {
        try {
            val picturesBase = context.getExternalFilesDir(android.os.Environment.DIRECTORY_PICTURES)
                ?: context.filesDir
            val appDir = File(picturesBase, "AISeeTest")
            if (!appDir.exists()) appDir.mkdirs()

            val dest = File(appDir, "AISee_${System.currentTimeMillis()}.jpg")
            val out = java.io.FileOutputStream(dest)
            bitmap.compress(android.graphics.Bitmap.CompressFormat.JPEG, 90, out)
            out.flush()
            out.close()

            Log.i(TAG, "Photo saved: ${dest.absolutePath}")
            android.media.MediaScannerConnection.scanFile(
                context, arrayOf(dest.absolutePath), arrayOf("image/jpeg"), null
            )
            handler.post {
                listener.onPhotoCaptured(android.net.Uri.fromFile(dest), dest.absolutePath)
            }
        } catch (e: Exception) {
            Log.e(TAG, "saveBitmapToPictures failed", e)
            handler.post {
                listener.onError(AiseeError.PHOTO_FAILED, e.message)
            }
        }
    }

    private val vendorCallback = object : VendorModelCallback() {
        override fun onStateChanged(state: Int) {
            super.onStateChanged(state)
            when (state) {
                PeripheralConnectionManager.STATE_DATA_PREPARED -> {
                    connected = true
                    handler.post {
                        listener.onConnectionState(ConnectionState.CONNECTED)
                    }

                    handler.post {
                        try {
                            if (client == null) {
                                client = SmartWearModelProxy.getInstance()
                                    .getModelClient(connection?.deviceAddress ?: "")
                            }
                            registerCallback()
                        } catch (e: Exception) {
                            listener.onError(AiseeError.INIT_FAILED, e.message)
                        }
                    }

                    Thread {
                        try {
                            handler.post {
                                listener.onConnectionState(ConnectionState.READY)
                            }
                        } catch (e: Exception) {
                            listener.onError(AiseeError.STT_FAILED, e.message)
                        }
                    }.start()
                }
                PeripheralConnectionManager.STATE_DEVICE_DISCONNECTED -> {
                    connected = false
                    handler.post {
                        listener.onConnectionState(ConnectionState.DISCONNECTED)
                    }
                }
            }
        }
    }

    private fun registerCallback() {
        client?.registerCallback(object : SmartWearModelCallback() {
            
            override fun onReceivedLiveStreamingData(data: ByteArray) {
                super.onReceivedLiveStreamingData(data)
                if (isStreaming) {
                    videoBuffer.write(data)
                }
            }

            override fun onReceivedUserVoice(pcmData: ByteArray) {
                if (pcmData.isEmpty()) {
                    Log.d(TAG, "onReceivedUserVoice called with empty data!")
                    return
                }
                
                if (isVoiceActive) {
                    // The SDK actually does decode OPUS and passes us raw PCM!
                    // (The pcmData size is ~960 bytes, which is 30ms of 16kHz PCM).
                    voiceStreamClient?.feedPcmChunk(pcmData)
                }
            }

            override fun onDeviceTriggeredTakePhoto() {
                super.onDeviceTriggeredTakePhoto()
                handler.post {
                    listener.onButtonPressed()
                }
                capturePhoto()
            }
        })
    }
}