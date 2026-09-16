package com.avidz.NeuroNudge.platform

import android.animation.ValueAnimator
import android.content.Context
import androidx.annotation.MainThread
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.io.Closeable

class NatureSoundPlayer(context: Context) : Closeable {
    enum class State { IDLE, BUFFERING, READY, PLAYING, ENDED }

    private val player = ExoPlayer.Builder(context.applicationContext).build()
    private var fadeAnimator: ValueAnimator? = null
    private val _state = MutableStateFlow(State.IDLE)
    val state: StateFlow<State> = _state.asStateFlow()

    init {
        player.addListener(object : Player.Listener {
            override fun onPlaybackStateChanged(playbackState: Int) {
                _state.value = when (playbackState) {
                    Player.STATE_BUFFERING -> State.BUFFERING
                    Player.STATE_READY -> if (player.isPlaying) State.PLAYING else State.READY
                    Player.STATE_ENDED -> State.ENDED
                    else -> State.IDLE
                }
            }

            override fun onIsPlayingChanged(isPlaying: Boolean) {
                if (isPlaying) _state.value = State.PLAYING
                else if (player.playbackState == Player.STATE_READY) _state.value = State.READY
            }
        })
    }

    @MainThread
    fun play(url: String, fadeInMillis: Long = 1_000) {
        fadeAnimator?.cancel()
        player.setMediaItem(MediaItem.fromUri(url))
        player.prepare()
        player.volume = if (fadeInMillis > 0) 0f else 1f
        player.play()
        if (fadeInMillis > 0) animateVolume(0f, 1f, fadeInMillis)
    }

    @MainThread
    fun pause(fadeOutMillis: Long = 500) {
        if (fadeOutMillis <= 0 || !player.isPlaying) {
            player.pause()
            return
        }
        animateVolume(player.volume, 0f, fadeOutMillis) {
            player.pause()
            player.volume = 1f
        }
    }

    @MainThread
    fun stop(fadeOutMillis: Long = 500) {
        if (fadeOutMillis <= 0 || !player.isPlaying) {
            player.stop()
            return
        }
        animateVolume(player.volume, 0f, fadeOutMillis) {
            player.stop()
            player.volume = 1f
        }
    }

    @MainThread
    fun setVolume(volume: Float) {
        fadeAnimator?.cancel()
        player.volume = volume.coerceIn(0f, 1f)
    }

    @MainThread
    override fun close() {
        fadeAnimator?.cancel()
        player.release()
        _state.value = State.IDLE
    }

    private fun animateVolume(from: Float, to: Float, duration: Long, onEnd: (() -> Unit)? = null) {
        fadeAnimator?.cancel()
        fadeAnimator = ValueAnimator.ofFloat(from, to).apply {
            this.duration = duration
            addUpdateListener { player.volume = it.animatedValue as Float }
            if (onEnd != null) {
                addListener(object : android.animation.AnimatorListenerAdapter() {
                    private var canceled = false

                    override fun onAnimationCancel(animation: android.animation.Animator) {
                        canceled = true
                    }

                    override fun onAnimationEnd(animation: android.animation.Animator) {
                        if (!canceled) onEnd()
                    }
                })
            }
            start()
        }
    }
}
