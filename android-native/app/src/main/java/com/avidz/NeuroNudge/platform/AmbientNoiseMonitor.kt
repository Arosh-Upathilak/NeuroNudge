package com.avidz.NeuroNudge.platform

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import androidx.core.content.ContextCompat
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.io.Closeable
import java.util.ArrayDeque
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import kotlin.math.log10
import kotlin.math.sqrt

class AmbientNoiseMonitor(private val context: Context) : Closeable {
    private val _decibels = MutableStateFlow<Float?>(null)
    val decibels: StateFlow<Float?> = _decibels.asStateFlow()

    @Volatile
    private var running = false
    private var audioRecord: AudioRecord? = null
    private var executor: ExecutorService? = null

    @Synchronized
    fun start() {
        if (running) return
        check(ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
            "RECORD_AUDIO permission is required"
        }

        val minBuffer = AudioRecord.getMinBufferSize(SAMPLE_RATE, CHANNEL_CONFIG, AUDIO_FORMAT)
        check(minBuffer > 0) { "AudioRecord is not supported on this device" }
        val recorder = AudioRecord(
            MediaRecorder.AudioSource.DEFAULT,
            SAMPLE_RATE,
            CHANNEL_CONFIG,
            AUDIO_FORMAT,
            maxOf(minBuffer, SAMPLE_RATE / 2),
        )
        check(recorder.state == AudioRecord.STATE_INITIALIZED) {
            recorder.release()
            "Unable to initialize AudioRecord"
        }

        audioRecord = recorder
        running = true
        recorder.startRecording()
        executor = Executors.newSingleThreadExecutor().also {
            it.execute { readAudio(recorder, maxOf(minBuffer, SAMPLE_RATE / 2)) }
        }
    }

    @Synchronized
    fun stop() {
        running = false
        val recorder = audioRecord
        audioRecord = null
        if (recorder?.recordingState == AudioRecord.RECORDSTATE_RECORDING) recorder.stop()
        recorder?.release()
        executor?.shutdownNow()
        executor = null
        _decibels.value = null
    }

    override fun close() = stop()

    private fun readAudio(recorder: AudioRecord, bufferSize: Int) {
        val buffer = ShortArray(bufferSize)
        val windows = ArrayDeque<SampleWindow>()
        var rollingSquares = 0.0
        var rollingSamples = 0

        while (running && audioRecord === recorder) {
            val count = recorder.read(buffer, 0, buffer.size, AudioRecord.READ_BLOCKING)
            if (count <= 0) continue
            var squares = 0.0
            for (index in 0 until count) {
                val sample = buffer[index].toDouble()
                squares += sample * sample
            }
            windows.addLast(SampleWindow(squares, count))
            rollingSquares += squares
            rollingSamples += count
            while (rollingSamples > ROLLING_SAMPLE_COUNT && windows.size > 1) {
                val removed = windows.removeFirst()
                rollingSquares -= removed.squares
                rollingSamples -= removed.count
            }

            val rms = sqrt(rollingSquares / rollingSamples.coerceAtLeast(1))
            val approximateDb = if (rms <= 0.0) MIN_DB else 20.0 * log10(rms / Short.MAX_VALUE) + MAX_DB
            _decibels.value = approximateDb.coerceIn(MIN_DB, MAX_DB).toFloat()
        }
    }

    private data class SampleWindow(val squares: Double, val count: Int)

    companion object {
        private const val SAMPLE_RATE = 16_000
        private const val ROLLING_SAMPLE_COUNT = SAMPLE_RATE * 5
        private const val MIN_DB = 30.0
        private const val MAX_DB = 95.0
        private const val CHANNEL_CONFIG = AudioFormat.CHANNEL_IN_MONO
        private const val AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT
    }
}
