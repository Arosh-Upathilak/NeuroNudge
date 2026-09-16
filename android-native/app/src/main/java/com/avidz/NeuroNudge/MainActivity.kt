package com.avidz.NeuroNudge

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.mutableStateOf
import com.avidz.NeuroNudge.ui.NeuroNudgeApp

class MainActivity : ComponentActivity() {
    private val deepLinkText = mutableStateOf<String?>(null)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        deepLinkText.value = intent.memoryText()
        setContent {
            NeuroNudgeApp(
                deepLinkText = deepLinkText.value,
                onDeepLinkConsumed = { deepLinkText.value = null },
            )
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        deepLinkText.value = intent.memoryText()
    }
}

private fun Intent.memoryText(): String? = memoryTextFromDeepLink(dataString)
