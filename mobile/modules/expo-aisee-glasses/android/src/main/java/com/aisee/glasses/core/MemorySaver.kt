package com.aisee.glasses.core

import android.util.Log
import org.json.JSONObject
import java.io.DataOutputStream
import java.io.File
import java.io.FileInputStream
import java.net.HttpURLConnection
import java.net.URL

/**
 * Posts a captured memory (image + transcript + GPS) to the NeuroNudge backend.
 *
 * Runs entirely on a background thread so the foreground service can call it
 * without touching the React Native JS bridge.
 */
object MemorySaver {
    private const val TAG = "MemorySaver"
    private const val BOUNDARY = "----AiSeeMemoryBoundary"

    data class MemoryPayload(
        val userText: String,
        val imageFile: File?,
        val latitude: Double?,
        val longitude: Double?,
        val authToken: String,
        val baseUrl: String,
    )

    data class MemoryResult(
        val success: Boolean,
        val reply: String?,
        val error: String?,
    )

    /**
     * Submits the memory to the backend on a background thread.
     * Calls [onResult] on the same background thread when complete.
     */
    fun save(payload: MemoryPayload, onResult: (MemoryResult) -> Unit) {
        Thread {
            try {
                val result = postMemory(payload)
                onResult(result)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to save memory", e)
                onResult(MemoryResult(false, null, e.message ?: "Unknown error"))
            }
        }.start()
    }

    private fun postMemory(payload: MemoryPayload): MemoryResult {
        val cleanBase = payload.baseUrl.trimEnd('/')
        val url = URL("${cleanBase}/api/nlp/chat")
        val conn = url.openConnection() as HttpURLConnection

        conn.requestMethod = "POST"
        conn.setRequestProperty("Authorization", "Bearer ${payload.authToken}")
        conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=$BOUNDARY")
        conn.doOutput = true
        conn.connectTimeout = 30000
        conn.readTimeout = 60000

        val outputStream = DataOutputStream(conn.outputStream)

        // userText field
        writeFormField(outputStream, "userText", payload.userText)

        // latitude
        if (payload.latitude != null) {
            writeFormField(outputStream, "latitude", payload.latitude.toString())
        }

        // longitude
        if (payload.longitude != null) {
            writeFormField(outputStream, "longitude", payload.longitude.toString())
        }

        // image file
        if (payload.imageFile != null && payload.imageFile.exists()) {
            writeFileField(outputStream, "image", payload.imageFile)
        }

        // Close boundary
        outputStream.writeBytes("--$BOUNDARY--\r\n")
        outputStream.flush()
        outputStream.close()

        val responseCode = conn.responseCode

        return if (responseCode == HttpURLConnection.HTTP_OK) {
            val responseStr = conn.inputStream.bufferedReader().use { it.readText() }
            conn.disconnect()

            val json = JSONObject(responseStr)
            val success = json.optBoolean("success", false)
            val data = json.optJSONObject("data")
            val reply = data?.optString("reply", "Memory saved") ?: "Memory saved"

            MemoryResult(success, reply, null)
        } else {
            val errorStr = conn.errorStream?.bufferedReader()?.use { it.readText() }
            conn.disconnect()
            Log.e(TAG, "HTTP $responseCode: $errorStr")
            MemoryResult(false, null, "HTTP $responseCode: ${errorStr.orEmpty()}")
        }
    }

    private fun writeFormField(out: DataOutputStream, name: String, value: String) {
        out.writeBytes("--$BOUNDARY\r\n")
        out.writeBytes("Content-Disposition: form-data; name=\"$name\"\r\n")
        out.writeBytes("\r\n")
        out.write(value.toByteArray(Charsets.UTF_8))
        out.writeBytes("\r\n")
    }

    private fun writeFileField(out: DataOutputStream, name: String, file: File) {
        val fileName = file.name
        val mimeType = if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
            "image/jpeg"
        } else {
            "image/png"
        }

        out.writeBytes("--$BOUNDARY\r\n")
        out.writeBytes("Content-Disposition: form-data; name=\"$name\"; filename=\"$fileName\"\r\n")
        out.writeBytes("Content-Type: $mimeType\r\n")
        out.writeBytes("\r\n")

        FileInputStream(file).use { fis ->
            val buffer = ByteArray(4096)
            var bytesRead: Int
            while (fis.read(buffer).also { bytesRead = it } != -1) {
                out.write(buffer, 0, bytesRead)
            }
        }

        out.writeBytes("\r\n")
    }
}
