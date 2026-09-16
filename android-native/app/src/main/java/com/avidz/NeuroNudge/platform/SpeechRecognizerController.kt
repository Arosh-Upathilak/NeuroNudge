package com.avidz.NeuroNudge.platform

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.io.Closeable
import java.util.Locale

class SpeechRecognizerController(context: Context) : Closeable {
    enum class State { IDLE, LISTENING, PROCESSING, ERROR, UNAVAILABLE }

    private val appContext = context.applicationContext
    private val mainHandler = Handler(Looper.getMainLooper())
    private var recognizer: SpeechRecognizer? = null
    private val _state = MutableStateFlow(State.IDLE)
    private val _transcript = MutableStateFlow("")
    private val _errorCode = MutableStateFlow<Int?>(null)

    val state: StateFlow<State> = _state.asStateFlow()
    val transcript: StateFlow<String> = _transcript.asStateFlow()
    val errorCode: StateFlow<Int?> = _errorCode.asStateFlow()

    fun startListening(languageTag: String = Locale.getDefault().toLanguageTag()) {
        mainHandler.post {
            if (!SpeechRecognizer.isRecognitionAvailable(appContext)) {
                _state.value = State.UNAVAILABLE
                return@post
            }
            val speechRecognizer = recognizer ?: SpeechRecognizer.createSpeechRecognizer(appContext).also {
                it.setRecognitionListener(listener)
                recognizer = it
            }
            _transcript.value = ""
            _errorCode.value = null
            _state.value = State.LISTENING
            speechRecognizer.startListening(Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, languageTag)
                putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5)
            })
        }
    }

    fun stopListening() = mainHandler.post { recognizer?.stopListening() }

    fun cancel() = mainHandler.post {
        recognizer?.cancel()
        _state.value = State.IDLE
    }

    override fun close() {
        mainHandler.post {
            recognizer?.destroy()
            recognizer = null
            _state.value = State.IDLE
        }
    }

    private val listener = object : RecognitionListener {
        override fun onReadyForSpeech(params: Bundle?) { _state.value = State.LISTENING }
        override fun onBeginningOfSpeech() = Unit
        override fun onRmsChanged(rmsdB: Float) = Unit
        override fun onBufferReceived(buffer: ByteArray?) = Unit
        override fun onEndOfSpeech() { _state.value = State.PROCESSING }
        override fun onEvent(eventType: Int, params: Bundle?) = Unit

        override fun onError(error: Int) {
            _errorCode.value = error
            _state.value = State.ERROR
        }

        override fun onResults(results: Bundle?) {
            updateTranscript(results)
            _state.value = State.IDLE
        }

        override fun onPartialResults(partialResults: Bundle?) {
            updateTranscript(partialResults)
        }
    }

    private fun updateTranscript(bundle: Bundle?) {
        bundle?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
            ?.firstOrNull()
            ?.let { _transcript.value = it }
    }
}
