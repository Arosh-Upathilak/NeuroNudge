package com.avidz.NeuroNudge

import com.avidz.NeuroNudge.data.ApiMemory
import java.net.URI
import java.net.URLDecoder
import java.nio.charset.StandardCharsets
import java.time.Duration
import java.time.Instant

const val MAX_DEEP_LINK_TEXT_LENGTH = 2_000

fun memoryTextFromDeepLink(url: String?): String? {
    val uri = runCatching { URI(url) }.getOrNull() ?: return null
    if (uri.scheme != "mobile" || uri.host != "memory") return null
    return uri.rawQuery.orEmpty().split('&').firstNotNullOfOrNull { field ->
        val parts = field.split('=', limit = 2)
        if (parts.firstOrNull() == "text") {
            runCatching {
                URLDecoder.decode(parts.getOrElse(1) { "" }, StandardCharsets.UTF_8.name())
                    .trim()
                    .take(MAX_DEEP_LINK_TEXT_LENGTH)
                    .takeIf(String::isNotEmpty)
            }.getOrNull()
        } else null
    }
}

fun dailySummaryMessage(memories: List<ApiMemory>, now: Instant = Instant.now()): String {
    val cutoff = now.minus(Duration.ofHours(24))
    val recent = memories.filter { runCatching { Instant.parse(it.createdAt).isAfter(cutoff) }.getOrDefault(false) }
    return when {
        recent.isEmpty() -> "Take a moment to remember where you placed something important today."
        recent.size <= 3 -> "Today you saved: ${recent.joinToString { it.title }}."
        else -> "Today you saved ${recent.take(3).joinToString { it.title }}, and ${recent.size - 3} more."
    }
}
