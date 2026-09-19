package com.aisee.glasses.core.voice

import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioTrack
import android.util.Log
import java.nio.ByteBuffer
import java.nio.ByteOrder

/**
 * VoiceStreamClient - Receives PCM audio bytes from the Realtek SDK callback
 * and converts them to 16-bit mono short arrays for the speech recognizer (Vosk).
 * Also includes live AudioTrack playback for debugging the microphone stream.
 */
class VoiceStreamClient(
    private val onPcmChunk: (ShortArray) -> Unit,
    private val onSilenceDetected: () -> Unit = {}
) {
    private val TAG = "VoiceStreamClient"
    private var audioTrack: AudioTrack? = null
    private val audioBuffer = mutableListOf<Short>()
    
    // VAD tracking
    private var recordingStartTime = 0L
    private var lastSpokeTime = 0L
    private val SILENCE_THRESHOLD_MS = 1500L
    private val MIN_RECORDING_MS = 8000L
    private val RMS_SPEECH_THRESHOLD = 200.0

    init {
        try {
            val minSize = AudioTrack.getMinBufferSize(
                16000,
                AudioFormat.CHANNEL_OUT_MONO,
                AudioFormat.ENCODING_PCM_16BIT
            )
            audioTrack = AudioTrack(
                AudioManager.STREAM_MUSIC,
                16000,
                AudioFormat.CHANNEL_OUT_MONO,
                AudioFormat.ENCODING_PCM_16BIT,
                minSize * 2,
                AudioTrack.MODE_STREAM
            )
            audioTrack?.play()
            Log.d(TAG, "AudioTrack initialized for live playback")
            
            resetVAD()
        } catch (e: Exception) {
            Log.e(TAG, "Failed to init AudioTrack", e)
        }
    }
    
    fun resetVAD() {
        val now = System.currentTimeMillis()
        recordingStartTime = now
        lastSpokeTime = now
    }

    /**
     * Converts PCM bytes (16-bit little-endian) to short array and forwards them.
     * @param pcmData Raw PCM bytes from the glasses microphone stream.
     */
    fun feedPcmChunk(pcmData: ByteArray) {
        if (pcmData.isEmpty()) return

        // 1. Play the raw PCM bytes directly to the phone speaker so the user can hear it!
        try {
            audioTrack?.write(pcmData, 0, pcmData.size)
        } catch (e: Exception) {
            Log.e(TAG, "AudioTrack write failed", e)
        }

        // 2. Convert to Little-Endian shorts
        val shortBuffer = ByteBuffer.wrap(pcmData)
            .order(ByteOrder.LITTLE_ENDIAN)
            .asShortBuffer()
            
        val shorts = ShortArray(shortBuffer.remaining())
        shortBuffer.get(shorts)
        
        audioBuffer.addAll(shorts.toList())
        
        // 3. VAD - Calculate RMS
        var sum = 0.0
        for (s in shorts) {
            sum += (s * s).toDouble()
        }
        val rms = Math.sqrt(sum / shorts.size)
        
        val now = System.currentTimeMillis()
        if (rms > RMS_SPEECH_THRESHOLD) {
            lastSpokeTime = now
        } else {
            val recordingDuration = now - recordingStartTime
            val silenceDuration = now - lastSpokeTime
            
            // Trigger silence if we've been recording for at least 8 seconds AND we have 1.5s of silence
            if (recordingDuration >= MIN_RECORDING_MS && silenceDuration >= SILENCE_THRESHOLD_MS) {
                // Prevent multiple triggers
                lastSpokeTime = now + 100000 
                onSilenceDetected()
            }
        }

        onPcmChunk(shorts)
    }

    fun saveToWav(context: android.content.Context): java.io.File? {
        Log.d(TAG, "saveToWav called, buffer size: ${audioBuffer.size}")
        if (audioBuffer.isEmpty()) {
            Log.w(TAG, "Cannot save WAV: audioBuffer is empty!")
            return null
        }
        try {
            val file = java.io.File(context.cacheDir, "last_voice.wav")
            val sampleRate = 16000
            val channels = 1
            val bitsPerSample = 16
            
            val byteData = ByteArray(audioBuffer.size * 2)
            for (i in audioBuffer.indices) {
                val s = audioBuffer[i].toInt()
                byteData[i * 2] = (s and 0xFF).toByte()
                byteData[i * 2 + 1] = ((s shr 8) and 0xFF).toByte()
            }
            
            val byteRate = sampleRate * channels * bitsPerSample / 8
            val totalDataLen = byteData.size + 36
            val totalAudioLen = byteData.size
            
            val out = java.io.FileOutputStream(file)
            val header = ByteArray(44)
            header[0] = 'R'.code.toByte()
            header[1] = 'I'.code.toByte()
            header[2] = 'F'.code.toByte()
            header[3] = 'F'.code.toByte()
            header[4] = (totalDataLen and 0xff).toByte()
            header[5] = ((totalDataLen shr 8) and 0xff).toByte()
            header[6] = ((totalDataLen shr 16) and 0xff).toByte()
            header[7] = ((totalDataLen shr 24) and 0xff).toByte()
            header[8] = 'W'.code.toByte()
            header[9] = 'A'.code.toByte()
            header[10] = 'V'.code.toByte()
            header[11] = 'E'.code.toByte()
            header[12] = 'f'.code.toByte()
            header[13] = 'm'.code.toByte()
            header[14] = 't'.code.toByte()
            header[15] = ' '.code.toByte()
            header[16] = 16
            header[17] = 0
            header[18] = 0
            header[19] = 0
            header[20] = 1
            header[21] = 0
            header[22] = channels.toByte()
            header[23] = 0
            header[24] = (sampleRate and 0xff).toByte()
            header[25] = ((sampleRate shr 8) and 0xff).toByte()
            header[26] = ((sampleRate shr 16) and 0xff).toByte()
            header[27] = ((sampleRate shr 24) and 0xff).toByte()
            header[28] = (byteRate and 0xff).toByte()
            header[29] = ((byteRate shr 8) and 0xff).toByte()
            header[30] = ((byteRate shr 16) and 0xff).toByte()
            header[31] = ((byteRate shr 24) and 0xff).toByte()
            header[32] = (channels * bitsPerSample / 8).toByte()
            header[33] = 0
            header[34] = bitsPerSample.toByte()
            header[35] = 0
            header[36] = 'd'.code.toByte()
            header[37] = 'a'.code.toByte()
            header[38] = 't'.code.toByte()
            header[39] = 'a'.code.toByte()
            header[40] = (totalAudioLen and 0xff).toByte()
            header[41] = ((totalAudioLen shr 8) and 0xff).toByte()
            header[42] = ((totalAudioLen shr 16) and 0xff).toByte()
            header[43] = ((totalAudioLen shr 24) and 0xff).toByte()
            
            out.write(header, 0, 44)
            out.write(byteData)
            out.close()
            
            Log.d(TAG, "Successfully saved WAV to ${file.absolutePath} (${byteData.size} bytes)")
            audioBuffer.clear()
            return file
        } catch (e: Exception) {
            Log.e(TAG, "Failed to save WAV", e)
        }
        return null
    }

    fun release() {
        try {
            audioTrack?.stop()
            audioTrack?.release()
            audioTrack = null
        } catch (e: Exception) {
            Log.e(TAG, "Error releasing AudioTrack", e)
        }
    }
}