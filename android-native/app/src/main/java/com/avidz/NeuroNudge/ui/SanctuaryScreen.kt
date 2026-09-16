package com.avidz.NeuroNudge.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bluetooth
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Headphones
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlin.math.roundToInt

enum class SanctuaryResponseMode {
    NONE,
    SOUND,
    ANC,
    BOTH,
}

enum class SanctuaryNatureSound {
    OCEAN,
    RIVER,
    RAIN,
}

@Composable
fun SanctuaryScreen(
    ambientNoiseDb: Float,
    thresholdDb: Float,
    sustainDelaySeconds: Int,
    responseMode: SanctuaryResponseMode,
    natureSound: SanctuaryNatureSound,
    isNatureSoundPlaying: Boolean,
    isSoundPeatsConnected: Boolean,
    hasMicrophonePermission: Boolean,
    hasBluetoothPermission: Boolean,
    isMonitoringEnabled: Boolean,
    onThresholdChange: (Float) -> Unit,
    onSustainDelayChange: (Int) -> Unit,
    onResponseModeChange: (SanctuaryResponseMode) -> Unit,
    onNatureSoundChange: (SanctuaryNatureSound) -> Unit,
    onNatureSoundPlaybackToggle: () -> Unit,
    onMonitoringEnabledChange: (Boolean) -> Unit,
    onSoundPeatsConnectionClick: () -> Unit,
    onRequestMicrophonePermission: () -> Unit,
    onRequestBluetoothPermission: () -> Unit,
    modifier: Modifier = Modifier,
    soundPeatsName: String = "SoundPeats Air4 Pro",
    onCalibrationStarted: () -> Unit = {},
    onCalibrationStopped: () -> Unit = {},
) {
    var showCalibration by rememberSaveable { mutableStateOf(false) }

    Surface(modifier = modifier.fillMaxSize(), color = SanctuaryColors.Background) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 20.dp, vertical = 24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            item {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        text = "Your sanctuary",
                        color = SanctuaryColors.Ink,
                        fontSize = 28.sp,
                        fontWeight = FontWeight.SemiBold,
                    )
                    Text(
                        text = "A softer response when the world gets loud.",
                        color = SanctuaryColors.MutedInk,
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
            }

            if (!hasMicrophonePermission) {
                item {
                    PermissionCard(
                        icon = Icons.Default.Mic,
                        title = "Microphone access needed",
                        message = "Allow access to measure nearby sound. Audio is not stored by this screen.",
                        actionLabel = "Allow microphone",
                        onAction = onRequestMicrophonePermission,
                    )
                }
            }

            item {
                AmbientNoiseCard(
                    ambientNoiseDb = ambientNoiseDb,
                    thresholdDb = thresholdDb,
                    enabled = hasMicrophonePermission && isMonitoringEnabled,
                    isMonitoringEnabled = isMonitoringEnabled,
                    canMonitor = hasMicrophonePermission,
                    onMonitoringEnabledChange = onMonitoringEnabledChange,
                )
            }

            item {
                SettingsCard(title = "Noise threshold", subtitle = "Choose when Sanctuary responds") {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        Text("Trigger level", color = SanctuaryColors.Ink, fontWeight = FontWeight.Medium)
                        ValuePill("${thresholdDb.roundToInt()} dB")
                    }
                    Slider(
                        value = thresholdDb.coerceIn(35f, 90f),
                        onValueChange = onThresholdChange,
                        enabled = hasMicrophonePermission,
                        valueRange = 35f..90f,
                        steps = 54,
                        colors = SliderDefaults.colors(
                            thumbColor = SanctuaryColors.Forest,
                            activeTrackColor = SanctuaryColors.Forest,
                            inactiveTrackColor = SanctuaryColors.SageLight,
                            disabledThumbColor = SanctuaryColors.Disabled,
                            disabledActiveTrackColor = SanctuaryColors.Disabled,
                        ),
                    )
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Quiet", style = MaterialTheme.typography.labelSmall, color = SanctuaryColors.MutedInk)
                        Text("Loud", style = MaterialTheme.typography.labelSmall, color = SanctuaryColors.MutedInk)
                    }
                    OutlinedButton(
                        onClick = {
                            onCalibrationStarted()
                            showCalibration = true
                        },
                        enabled = hasMicrophonePermission,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(18.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = SanctuaryColors.Forest),
                    ) {
                        Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(Modifier.size(8.dp))
                        Text("Calibrate for this space")
                    }
                    if (!hasMicrophonePermission) {
                        DisabledHint("Enable microphone access to adjust or calibrate the threshold.")
                    }
                }
            }

            item {
                SettingsCard(title = "Sustain delay", subtitle = "Respond only if noise stays high") {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf(1, 3, 5, 10).forEach { seconds ->
                            SelectablePill(
                                label = "$seconds sec",
                                selected = sustainDelaySeconds == seconds,
                                onClick = { onSustainDelayChange(seconds) },
                                modifier = Modifier.weight(1f),
                            )
                        }
                    }
                    Text(
                        text = "Short sounds will be ignored until they last $sustainDelaySeconds second${if (sustainDelaySeconds == 1) "" else "s"}.",
                        color = SanctuaryColors.MutedInk,
                        style = MaterialTheme.typography.bodySmall,
                    )
                }
            }

            item {
                SettingsCard(title = "Response", subtitle = "What should happen above the threshold") {
                    ResponseModeGrid(selected = responseMode, onSelected = onResponseModeChange)
                }
            }

            item {
                val soundResponseEnabled = responseMode == SanctuaryResponseMode.SOUND ||
                    responseMode == SanctuaryResponseMode.BOTH
                SettingsCard(title = "Nature sound", subtitle = "A familiar layer of calm") {
                    Column(
                        modifier = Modifier.alpha(if (soundResponseEnabled) 1f else 0.45f),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            SanctuaryNatureSound.entries.forEach { sound ->
                                SelectablePill(
                                    label = sound.displayName,
                                    selected = natureSound == sound,
                                    enabled = soundResponseEnabled,
                                    onClick = { onNatureSoundChange(sound) },
                                    modifier = Modifier.weight(1f),
                                )
                            }
                        }
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(SanctuaryColors.SageWash, RoundedCornerShape(18.dp))
                                .padding(horizontal = 16.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Icon(Icons.Default.VolumeUp, contentDescription = null, tint = SanctuaryColors.Forest)
                            Column(modifier = Modifier.weight(1f).padding(horizontal = 12.dp)) {
                                Text(natureSound.displayName, color = SanctuaryColors.Ink, fontWeight = FontWeight.Medium)
                                Text(
                                    if (isNatureSoundPlaying) "Preview playing" else "Preview sound",
                                    color = SanctuaryColors.MutedInk,
                                    style = MaterialTheme.typography.bodySmall,
                                )
                            }
                            IconButton(onClick = onNatureSoundPlaybackToggle, enabled = soundResponseEnabled) {
                                Icon(
                                    imageVector = if (isNatureSoundPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                                    contentDescription = if (isNatureSoundPlaying) "Pause preview" else "Play preview",
                                    tint = SanctuaryColors.Forest,
                                )
                            }
                        }
                    }
                    if (!soundResponseEnabled) {
                        DisabledHint("Choose Sound or Both to enable nature sounds.")
                    }
                }
            }

            item {
                SoundPeatsCard(
                    name = soundPeatsName,
                    connected = isSoundPeatsConnected,
                    hasBluetoothPermission = hasBluetoothPermission,
                    onConnectionClick = onSoundPeatsConnectionClick,
                    onRequestPermission = onRequestBluetoothPermission,
                )
            }

            item { Spacer(Modifier.height(8.dp)) }
        }
    }

    if (showCalibration) {
        CalibrationDialog(
            ambientNoiseDb = ambientNoiseDb,
            onDismiss = { onCalibrationStopped(); showCalibration = false },
            onSelectThreshold = {
                onThresholdChange(it)
                onCalibrationStopped()
                showCalibration = false
            },
        )
    }
}

@Composable
private fun AmbientNoiseCard(
    ambientNoiseDb: Float,
    thresholdDb: Float,
    enabled: Boolean,
    isMonitoringEnabled: Boolean,
    canMonitor: Boolean,
    onMonitoringEnabledChange: (Boolean) -> Unit,
) {
    val isAboveThreshold = enabled && ambientNoiseDb >= thresholdDb
    Card(
        shape = RoundedCornerShape(28.dp),
        colors = CardDefaults.cardColors(containerColor = SanctuaryColors.Forest),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
    ) {
        Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(42.dp)
                        .background(Color.White.copy(alpha = 0.13f), CircleShape),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(Icons.Default.Mic, contentDescription = null, tint = SanctuaryColors.Cream)
                }
                Column(modifier = Modifier.weight(1f).padding(horizontal = 12.dp)) {
                    Text("Ambient noise", color = SanctuaryColors.Cream, fontWeight = FontWeight.Medium)
                    Text(
                        when {
                            !canMonitor -> "Permission required"
                            !isMonitoringEnabled -> "Monitoring paused"
                            isAboveThreshold -> "Above your threshold"
                            else -> "Within your comfort range"
                        },
                        color = SanctuaryColors.Cream.copy(alpha = 0.72f),
                        style = MaterialTheme.typography.bodySmall,
                    )
                }
                Switch(
                    checked = isMonitoringEnabled && canMonitor,
                    onCheckedChange = onMonitoringEnabledChange,
                    enabled = canMonitor,
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = SanctuaryColors.Forest,
                        checkedTrackColor = SanctuaryColors.Cream,
                        uncheckedThumbColor = SanctuaryColors.Cream,
                        uncheckedTrackColor = Color.White.copy(alpha = 0.18f),
                    ),
                )
            }

            Row(verticalAlignment = Alignment.Bottom) {
                Text(
                    text = if (enabled) ambientNoiseDb.coerceAtLeast(0f).roundToInt().toString() else "--",
                    color = SanctuaryColors.Cream,
                    fontSize = 44.sp,
                    lineHeight = 44.sp,
                    fontWeight = FontWeight.SemiBold,
                )
                Text(
                    text = " dB",
                    modifier = Modifier.padding(bottom = 5.dp),
                    color = SanctuaryColors.Cream.copy(alpha = 0.72f),
                    style = MaterialTheme.typography.titleMedium,
                )
            }

            NoiseVisualizer(
                levelDb = ambientNoiseDb,
                thresholdDb = thresholdDb,
                enabled = enabled,
                modifier = Modifier.fillMaxWidth().height(68.dp),
            )
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("20 dB", color = SanctuaryColors.Cream.copy(alpha = 0.58f), style = MaterialTheme.typography.labelSmall)
                Text(
                    "Threshold ${thresholdDb.roundToInt()} dB",
                    color = SanctuaryColors.Cream.copy(alpha = 0.78f),
                    style = MaterialTheme.typography.labelSmall,
                )
                Text("100 dB", color = SanctuaryColors.Cream.copy(alpha = 0.58f), style = MaterialTheme.typography.labelSmall)
            }
        }
    }
}

@Composable
private fun NoiseVisualizer(levelDb: Float, thresholdDb: Float, enabled: Boolean, modifier: Modifier = Modifier) {
    val normalizedLevel = ((levelDb - 20f) / 80f).coerceIn(0f, 1f)
    val normalizedThreshold = ((thresholdDb - 20f) / 80f).coerceIn(0f, 1f)
    Canvas(
        modifier = modifier.semantics {
            contentDescription = if (enabled) "Ambient noise ${levelDb.roundToInt()} decibels" else "Noise monitoring paused"
        },
    ) {
        val bars = 24
        val gap = 5.dp.toPx()
        val barWidth = (size.width - gap * (bars - 1)) / bars
        repeat(bars) { index ->
            val barProgress = (index + 1f) / bars
            val heightFactor = 0.34f + ((index * 7) % 9) / 14f
            val barHeight = size.height * heightFactor.coerceAtMost(1f)
            drawRoundRect(
                color = when {
                    !enabled -> Color.White.copy(alpha = 0.12f)
                    barProgress <= normalizedLevel -> SanctuaryColors.Cream
                    else -> Color.White.copy(alpha = 0.18f)
                },
                topLeft = androidx.compose.ui.geometry.Offset(index * (barWidth + gap), size.height - barHeight),
                size = androidx.compose.ui.geometry.Size(barWidth, barHeight),
                cornerRadius = androidx.compose.ui.geometry.CornerRadius(barWidth / 2f),
            )
        }
        val thresholdX = size.width * normalizedThreshold
        drawLine(
            color = SanctuaryColors.Peach,
            start = androidx.compose.ui.geometry.Offset(thresholdX, 0f),
            end = androidx.compose.ui.geometry.Offset(thresholdX, size.height),
            strokeWidth = 2.dp.toPx(),
            cap = StrokeCap.Round,
        )
    }
}

@Composable
private fun SettingsCard(
    title: String,
    subtitle: String,
    content: @Composable ColumnScope.() -> Unit,
) {
    Card(
        shape = RoundedCornerShape(26.dp),
        colors = CardDefaults.cardColors(containerColor = SanctuaryColors.Card),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
    ) {
        Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(title, color = SanctuaryColors.Ink, fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
                Text(subtitle, color = SanctuaryColors.MutedInk, style = MaterialTheme.typography.bodySmall)
            }
            content()
        }
    }
}

@Composable
private fun ResponseModeGrid(
    selected: SanctuaryResponseMode,
    onSelected: (SanctuaryResponseMode) -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            ResponseModeCard(SanctuaryResponseMode.NONE, "None", "Observe only", selected, onSelected, Modifier.weight(1f))
            ResponseModeCard(SanctuaryResponseMode.SOUND, "Sound", "Play nature audio", selected, onSelected, Modifier.weight(1f))
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            ResponseModeCard(SanctuaryResponseMode.ANC, "ANC", "Noise cancelling", selected, onSelected, Modifier.weight(1f))
            ResponseModeCard(SanctuaryResponseMode.BOTH, "Both", "Sound + ANC", selected, onSelected, Modifier.weight(1f))
        }
    }
}

@Composable
private fun ResponseModeCard(
    mode: SanctuaryResponseMode,
    title: String,
    subtitle: String,
    selected: SanctuaryResponseMode,
    onSelected: (SanctuaryResponseMode) -> Unit,
    modifier: Modifier = Modifier,
) {
    val isSelected = selected == mode
    Column(
        modifier = modifier
            .clickable { onSelected(mode) }
            .background(
                if (isSelected) SanctuaryColors.SageWash else SanctuaryColors.Background,
                RoundedCornerShape(18.dp),
            )
            .padding(14.dp),
        verticalArrangement = Arrangement.spacedBy(3.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(title, modifier = Modifier.weight(1f), color = SanctuaryColors.Ink, fontWeight = FontWeight.SemiBold)
            if (isSelected) {
                Icon(Icons.Default.Check, contentDescription = "Selected", tint = SanctuaryColors.Forest, modifier = Modifier.size(18.dp))
            }
        }
        Text(subtitle, color = SanctuaryColors.MutedInk, style = MaterialTheme.typography.labelSmall)
    }
}

@Composable
private fun SelectablePill(
    label: String,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    Box(
        modifier = modifier
            .clickable(enabled = enabled, onClick = onClick)
            .background(
                color = if (selected) SanctuaryColors.Forest else SanctuaryColors.Background,
                shape = RoundedCornerShape(16.dp),
            )
            .padding(horizontal = 8.dp, vertical = 11.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = label,
            color = if (selected) SanctuaryColors.Cream else SanctuaryColors.Ink,
            fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal,
            style = MaterialTheme.typography.labelMedium,
            maxLines = 1,
        )
    }
}

@Composable
private fun SoundPeatsCard(
    name: String,
    connected: Boolean,
    hasBluetoothPermission: Boolean,
    onConnectionClick: () -> Unit,
    onRequestPermission: () -> Unit,
) {
    Card(
        shape = RoundedCornerShape(26.dp),
        colors = CardDefaults.cardColors(containerColor = SanctuaryColors.Card),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
    ) {
        Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier.size(48.dp).background(SanctuaryColors.SageWash, CircleShape),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(Icons.Default.Headphones, contentDescription = null, tint = SanctuaryColors.Forest)
                }
                Column(modifier = Modifier.weight(1f).padding(horizontal = 12.dp)) {
                    Text(name, color = SanctuaryColors.Ink, fontWeight = FontWeight.SemiBold)
                    Text(
                        when {
                            !hasBluetoothPermission -> "Bluetooth permission needed"
                            connected -> "Connected and ready for ANC"
                            else -> "Not connected"
                        },
                        color = if (connected) SanctuaryColors.Forest else SanctuaryColors.MutedInk,
                        style = MaterialTheme.typography.bodySmall,
                    )
                }
                Box(
                    modifier = Modifier
                        .size(10.dp)
                        .background(if (connected) SanctuaryColors.Success else SanctuaryColors.Disabled, CircleShape),
                )
            }
            Button(
                onClick = if (hasBluetoothPermission) onConnectionClick else onRequestPermission,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(18.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (connected) SanctuaryColors.SageWash else SanctuaryColors.Forest,
                    contentColor = if (connected) SanctuaryColors.Forest else SanctuaryColors.Cream,
                ),
            ) {
                Icon(Icons.Default.Bluetooth, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.size(8.dp))
                Text(
                    when {
                        !hasBluetoothPermission -> "Allow Bluetooth"
                        connected -> "Manage connection"
                        else -> "Connect SoundPeats"
                    },
                )
            }
        }
    }
}

@Composable
private fun PermissionCard(
    icon: ImageVector,
    title: String,
    message: String,
    actionLabel: String,
    onAction: () -> Unit,
) {
    Card(
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.cardColors(containerColor = SanctuaryColors.WarningWash),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
    ) {
        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(icon, contentDescription = null, tint = SanctuaryColors.Warning, modifier = Modifier.size(24.dp))
            Column(modifier = Modifier.weight(1f).padding(horizontal = 12.dp)) {
                Text(title, color = SanctuaryColors.Ink, fontWeight = FontWeight.SemiBold)
                Text(message, color = SanctuaryColors.MutedInk, style = MaterialTheme.typography.bodySmall)
            }
            OutlinedButton(onClick = onAction, shape = RoundedCornerShape(14.dp), contentPadding = PaddingValues(horizontal = 12.dp)) {
                Text(actionLabel, textAlign = TextAlign.Center, style = MaterialTheme.typography.labelMedium)
            }
        }
    }
}

@Composable
private fun CalibrationDialog(
    ambientNoiseDb: Float,
    onDismiss: () -> Unit,
    onSelectThreshold: (Float) -> Unit,
) {
    var secondsRemaining by remember { mutableIntStateOf(15) }
    var peakNoiseDb by remember { mutableFloatStateOf(ambientNoiseDb.coerceAtLeast(35f)) }

    LaunchedEffect(ambientNoiseDb, secondsRemaining) {
        if (secondsRemaining > 0 && ambientNoiseDb > peakNoiseDb) peakNoiseDb = ambientNoiseDb
    }
    LaunchedEffect(Unit) {
        while (secondsRemaining > 0) {
            delay(1_000)
            secondsRemaining--
        }
    }

    val suggestedThreshold = (peakNoiseDb + 8f).coerceIn(35f, 90f).roundToInt().toFloat()
    val complete = secondsRemaining == 0

    AlertDialog(
        onDismissRequest = onDismiss,
        shape = RoundedCornerShape(28.dp),
        containerColor = SanctuaryColors.Card,
        icon = {
            Box(
                modifier = Modifier.size(52.dp).background(SanctuaryColors.SageWash, CircleShape),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = if (complete) Icons.Default.Check else Icons.Default.Mic,
                    contentDescription = null,
                    tint = SanctuaryColors.Forest,
                )
            }
        },
        title = { Text(if (complete) "Threshold ready" else "Listening to your space", color = SanctuaryColors.Ink) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                Text(
                    if (complete) "We added a gentle buffer above the loudest sound measured."
                    else "Keep your surroundings as they usually are while we listen for 15 seconds.",
                    color = SanctuaryColors.MutedInk,
                )
                LinearProgressIndicator(
                    progress = { (15 - secondsRemaining) / 15f },
                    modifier = Modifier.fillMaxWidth().height(8.dp),
                    color = SanctuaryColors.Forest,
                    trackColor = SanctuaryColors.SageLight,
                    strokeCap = StrokeCap.Round,
                )
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(
                        if (complete) "Suggested threshold" else "${15 - secondsRemaining} of 15 seconds",
                        color = SanctuaryColors.MutedInk,
                        style = MaterialTheme.typography.bodySmall,
                    )
                    Text(
                        if (complete) "${suggestedThreshold.roundToInt()} dB" else "$secondsRemaining sec",
                        color = SanctuaryColors.Forest,
                        fontWeight = FontWeight.SemiBold,
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { onSelectThreshold(suggestedThreshold) },
                enabled = complete,
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = SanctuaryColors.Forest),
            ) {
                Text(if (complete) "Use ${suggestedThreshold.roundToInt()} dB" else "Listening...")
            }
        },
        dismissButton = { OutlinedButton(onClick = onDismiss, shape = RoundedCornerShape(16.dp)) { Text("Cancel") } },
    )
}

@Composable
private fun ValuePill(value: String) {
    Text(
        text = value,
        modifier = Modifier.background(SanctuaryColors.SageWash, RoundedCornerShape(12.dp)).padding(horizontal = 12.dp, vertical = 6.dp),
        color = SanctuaryColors.Forest,
        fontWeight = FontWeight.SemiBold,
        style = MaterialTheme.typography.labelLarge,
    )
}

@Composable
private fun DisabledHint(message: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(Icons.Default.Warning, contentDescription = null, tint = SanctuaryColors.MutedInk, modifier = Modifier.size(15.dp))
        Text(
            text = message,
            modifier = Modifier.padding(start = 6.dp),
            color = SanctuaryColors.MutedInk,
            style = MaterialTheme.typography.labelSmall,
        )
    }
}

private val SanctuaryNatureSound.displayName: String
    get() = when (this) {
        SanctuaryNatureSound.OCEAN -> "Ocean"
        SanctuaryNatureSound.RIVER -> "River"
        SanctuaryNatureSound.RAIN -> "Rain"
    }

private object SanctuaryColors {
    val Background = Color(0xFFF3EDE2)
    val Card = Color(0xFFFFFBF3)
    val Cream = Color(0xFFFFF8E9)
    val Ink = Color(0xFF28342E)
    val MutedInk = Color(0xFF6F776F)
    val Forest = Color(0xFF355E4A)
    val SageWash = Color(0xFFDCE8D8)
    val SageLight = Color(0xFFC7D5C3)
    val Peach = Color(0xFFF2B98D)
    val Success = Color(0xFF5B8A67)
    val Disabled = Color(0xFFAAAFA8)
    val Warning = Color(0xFF9A6139)
    val WarningWash = Color(0xFFF5DFCB)
}
