package com.avidz.NeuroNudge

import com.avidz.NeuroNudge.data.ApiMemory
import com.avidz.NeuroNudge.data.MAX_CHAT_IMAGE_BYTES
import com.avidz.NeuroNudge.data.NlpChatResponse
import com.avidz.NeuroNudge.data.PreferenceField
import com.avidz.NeuroNudge.data.PreferenceMutation
import com.avidz.NeuroNudge.data.requiredChatText
import com.google.gson.Gson
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import java.time.Instant

class AppLogicTest {
    @Test
    fun `compound preference mutation preserves typed field values`() {
        val mutation = PreferenceMutation.Compound(
            listOf(
                PreferenceMutation.BooleanValue(PreferenceField.PushNotifications, false),
                PreferenceMutation.BooleanValue(PreferenceField.DailySummary, false),
            ),
        )

        assertEquals(2, mutation.changes.size)
        assertEquals(PreferenceField.PushNotifications, (mutation.changes[0] as PreferenceMutation.BooleanValue).field)
        assertEquals(false, (mutation.changes[0] as PreferenceMutation.BooleanValue).value)
    }

    @Test
    fun `verified bootstrap exposes pending and failed outcomes`() {
        assertEquals(BootstrapStatus.Pending, AppUiState().bootstrapStatus)
        assertEquals(BootstrapStatus.Failed, AppUiState(bootstrapStatus = BootstrapStatus.Failed).bootstrapStatus)
    }

    @Test
    fun `memory deep link decodes one-shot command`() {
        assertEquals("find my blue keys", memoryTextFromDeepLink("mobile://memory?text=find+my+blue+keys"))
        assertNull(memoryTextFromDeepLink("https://example.com/memory?text=no"))
        assertNull(memoryTextFromDeepLink("mobile://memory?text=%20%20"))
    }

    @Test
    fun `memory deep link bounds decoded text`() {
        val text = memoryTextFromDeepLink("mobile://memory?text=${"x".repeat(MAX_DEEP_LINK_TEXT_LENGTH + 100)}")

        assertEquals(MAX_DEEP_LINK_TEXT_LENGTH, text?.length)
    }

    @Test
    fun `daily summary includes only previous 24 hours`() {
        val now = Instant.parse("2026-08-20T12:00:00Z")
        val memories = listOf(
            memory("Keys", "2026-08-20T08:00:00Z"),
            memory("Wallet", "2026-08-18T08:00:00Z"),
        )
        assertEquals("Today you saved: Keys.", dailySummaryMessage(memories, now))
    }

    @Test
    fun `nlp parser retains legacy createdat field`() {
        val response = Gson().fromJson(
            """{"reply":"Found it","memories":[{"title":"Keys","createdat":"2026-08-20T08:00:00Z"}]}""",
            NlpChatResponse::class.java,
        )
        assertEquals("2026-08-20T08:00:00Z", response.memories?.single()?.createdat)
    }

    @Test
    fun `chat rejects blank text without changing accepted text`() {
        assertNull(requiredChatText(" \t\n"))
        assertEquals("find my keys", requiredChatText("  find my keys  "))
    }

    @Test
    fun `chat image upload cap is ten megabytes`() {
        assertEquals(10L * 1024L * 1024L, MAX_CHAT_IMAGE_BYTES)
    }

    private fun memory(title: String, createdAt: String) = ApiMemory(
        memoryId = title,
        userId = "user",
        title = title,
        description = null,
        createdAt = createdAt,
        image = null,
        location = null,
    )
}
