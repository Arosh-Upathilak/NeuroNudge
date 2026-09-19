package com.aisee.glasses.core

import android.net.Uri

/**
 * Listener interface for the AISee glasses controller.
 * All callbacks are delivered on the main (UI) thread.
 */
interface AiseeListener {

    /** Connection lifecycle. */
    fun onConnectionState(state: ConnectionState)

    /** Real-time transcript of the glasses microphone audio. */
    fun onTranscript(text: String, isFinal: Boolean)

    /**
     * Trigger phrase detected. The glasses user said "hey nudge" followed by a
     * sentence; [sentence] is the text that followed the trigger phrase.
     */
    fun onTriggerDetected(sentence: String)

    /** A photo was captured from the glasses. [uri] is a MediaStore content URI. */
    fun onPhotoCaptured(uri: Uri, path: String)

    /** Audio recording was saved. */
    fun onAudioSaved(path: String)

    /** Button was pressed. */
    fun onButtonPressed()

    /** Error encountered. */
    fun onError(error: AiseeError, message: String? = null)
}

/** A no-op implementation so consumers only need to override what they care about. */
open class SimpleAiseeListener : AiseeListener {
    override fun onConnectionState(state: ConnectionState) {}
    override fun onTranscript(text: String, isFinal: Boolean) {}
    override fun onTriggerDetected(sentence: String) {}
    override fun onPhotoCaptured(uri: Uri, path: String) {}
    override fun onAudioSaved(path: String) {}
    override fun onButtonPressed() {}
    override fun onError(error: AiseeError, message: String?) {}
}