package com.avidz.NeuroNudge.platform

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import java.io.Closeable
import java.util.concurrent.Executors
import kotlin.random.Random

class CalibrationNoisePlayer : Closeable {
    @Volatile private var running = false
    private var track: AudioTrack? = null
    private var executor = Executors.newSingleThreadExecutor()

    fun start(durationMillis: Long = 15_000) {
        stop()
        if (executor.isShutdown) executor = Executors.newSingleThreadExecutor()
        val minBuffer = AudioTrack.getMinBufferSize(44_100, AudioFormat.CHANNEL_OUT_MONO, AudioFormat.ENCODING_PCM_16BIT)
        val audioTrack = AudioTrack.Builder()
            .setAudioAttributes(AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION).setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build())
            .setAudioFormat(AudioFormat.Builder().setSampleRate(44_100).setChannelMask(AudioFormat.CHANNEL_OUT_MONO).setEncoding(AudioFormat.ENCODING_PCM_16BIT).build())
            .setBufferSizeInBytes(minBuffer * 2)
            .setTransferMode(AudioTrack.MODE_STREAM)
            .build()
        track = audioTrack
        running = true
        audioTrack.play()
        executor.execute {
            val started = System.currentTimeMillis()
            val samples = ShortArray(minBuffer / 2)
            while (running && System.currentTimeMillis() - started < durationMillis) {
                val progress = ((System.currentTimeMillis() - started).toFloat() / durationMillis).coerceIn(0.02f, 1f)
                val amplitude = (Short.MAX_VALUE * progress * 0.22f).toInt()
                for (index in samples.indices) samples[index] = Random.nextInt(-amplitude, amplitude + 1).toShort()
                audioTrack.write(samples, 0, samples.size, AudioTrack.WRITE_BLOCKING)
            }
            if (track === audioTrack) {
                track = null
                stopTrack(audioTrack)
            }
        }
    }

    fun stop() {
        running = false
        val current = track
        track = null
        current?.let(::stopTrack)
    }

    override fun close() {
        stop()
        executor.shutdownNow()
    }

    private fun stopTrack(audioTrack: AudioTrack) {
        runCatching { if (audioTrack.playState == AudioTrack.PLAYSTATE_PLAYING) audioTrack.stop() }
        audioTrack.release()
        if (track === audioTrack) track = null
    }
}
