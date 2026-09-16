package com.avidz.NeuroNudge.platform

import android.content.Context
import android.net.Uri
import androidx.core.content.FileProvider
import java.io.File
import java.util.UUID

object CameraTempUriHelper {
    data class CaptureTarget(val uri: Uri, val file: File)

    fun create(context: Context): CaptureTarget {
        val directory = File(context.cacheDir, "camera").apply { mkdirs() }
        check(directory.isDirectory) { "Unable to create camera cache directory" }
        val file = File(directory, "capture-${UUID.randomUUID()}.jpg")
        val uri = FileProvider.getUriForFile(context, "${context.packageName}.files", file)
        return CaptureTarget(uri, file)
    }

    fun delete(target: CaptureTarget): Boolean = !target.file.exists() || target.file.delete()
}
