package com.aisee.glasses.core.voice

import android.util.Base64
import android.util.Log
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedOutputStream
import java.io.File
import java.io.FileInputStream
import java.net.HttpURLConnection
import java.net.URL

object GeminiSttClient {
    private const val TAG = "GeminiSttClient"
    private const val URL_STRING = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-transcribe:generateContent"

    fun transcribeWav(wavFile: File, apiKey: String, onResult: (String?) -> Unit) {
        if (apiKey.isBlank()) {
            Log.e(TAG, "GEMINI_API_KEY is not set!")
            onResult(null)
            return
        }

        if (!wavFile.exists()) {
            Log.e(TAG, "WAV file does not exist: ${wavFile.absolutePath}")
            onResult(null)
            return
        }

        Thread {
            try {
                // Read audio bytes
                val audioBytes = ByteArray(wavFile.length().toInt())
                FileInputStream(wavFile).use { it.read(audioBytes) }

                // Encode to Base64
                val base64Audio = Base64.encodeToString(audioBytes, Base64.NO_WRAP)

                // Build JSON payload
                val inlineData = JSONObject().apply {
                    put("mimeType", "audio/wav")
                    put("data", base64Audio)
                }

                val part1 = JSONObject().apply { put("text", "Transcribe this audio exactly as spoken.") }
                val part2 = JSONObject().apply { put("inlineData", inlineData) }

                val partsArray = JSONArray().apply {
                    put(part1)
                    put(part2)
                }

                val content = JSONObject().apply { put("parts", partsArray) }
                val contentsArray = JSONArray().apply { put(content) }
                val root = JSONObject().apply { put("contents", contentsArray) }

                val payloadBytes = root.toString().toByteArray(Charsets.UTF_8)

                // Make request
                val url = URL("$URL_STRING?key=$API_KEY")
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json")
                conn.doOutput = true
                conn.setFixedLengthStreamingMode(payloadBytes.size)

                BufferedOutputStream(conn.outputStream).use { os ->
                    os.write(payloadBytes)
                    os.flush()
                }

                val responseCode = conn.responseCode
                if (responseCode == HttpURLConnection.HTTP_OK) {
                    val responseStr = conn.inputStream.bufferedReader().use { it.readText() }
                    val jsonResponse = JSONObject(responseStr)
                    
                    val text = jsonResponse.optJSONArray("candidates")
                        ?.optJSONObject(0)
                        ?.optJSONObject("content")
                        ?.optJSONArray("parts")
                        ?.optJSONObject(0)
                        ?.optJSONObject("audioTranscription")
                        ?.optString("text")

                    if (!text.isNullOrEmpty()) {
                        onResult(text)
                    } else {
                        Log.e(TAG, "Failed to parse text from Gemini response: $responseStr")
                        onResult(null)
                    }
                } else {
                    val errorStr = conn.errorStream?.bufferedReader()?.use { it.readText() }
                    Log.e(TAG, "HTTP Error $responseCode: $errorStr")
                    onResult(null)
                }
                
                conn.disconnect()

            } catch (e: Exception) {
                Log.e(TAG, "Transcription failed", e)
                onResult(null)
            }
        }.start()
    }
}
