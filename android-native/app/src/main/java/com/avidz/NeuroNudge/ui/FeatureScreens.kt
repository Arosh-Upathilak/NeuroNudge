package com.avidz.NeuroNudge.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Bluetooth
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.ChatBubbleOutline
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Insights
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.MarkEmailRead
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.NotificationsNone
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Slider
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.avidz.NeuroNudge.data.ApiMemory
import com.avidz.NeuroNudge.data.AppPreferences
import com.avidz.NeuroNudge.data.PreferenceField
import com.avidz.NeuroNudge.data.PreferenceMutation

private val Canvas = Color(0xFFF6F0E5)
private val CardCream = Color(0xFFFFFBF3)
private val Forest = Color(0xFF315C4C)
private val Sage = Color(0xFFDDE8DD)
private val Moss = Color(0xFF789379)
private val Ink = Color(0xFF24332D)
private val MutedInk = Color(0xFF68736D)
private val Hairline = Color(0xFFE5DDCF)
private val SoftRose = Color(0xFFF5DEDA)

data class DashboardState(
    val userName: String,
    val greeting: String = "Welcome back",
    val focusMinutes: Int = 0,
    val memoriesThisWeek: Int = 0,
    val mindfulStreakDays: Int = 0,
    val unreadNotifications: Int = 0,
    val insight: String = "Small pauses throughout the day can make space for clearer thinking.",
    val recentMemories: List<ApiMemory> = emptyList(),
    val ambientMonitoringEnabled: Boolean = true,
)

enum class NotificationFilter(val label: String) {
    All("All"),
    Unread("Unread"),
    Reminders("Reminders"),
    Insights("Insights"),
}

enum class NotificationKind {
    Reminder,
    Insight,
    Update,
}

data class NotificationFeedItem(
    val id: String,
    val title: String,
    val message: String,
    val timeLabel: String,
    val kind: NotificationKind = NotificationKind.Update,
    val isRead: Boolean = false,
)

enum class SettingsTab(val label: String) {
    Profile("Profile"),
    Alerts("Alerts"),
    Privacy("Privacy"),
}

data class ProfileState(
    val name: String,
    val email: String,
    val memberSince: String = "",
)

@Composable
fun DashboardScreen(
    state: DashboardState,
    onAddMemory: () -> Unit,
    onOpenMemory: (ApiMemory) -> Unit,
    onOpenNotifications: () -> Unit,
    onOpenChat: () -> Unit,
    onAmbientMonitoringChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier,
) {
    ScreenSurface(modifier) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(state.greeting, color = MutedInk, fontSize = 14.sp)
                        Text(
                            text = state.userName.ifBlank { "Friend" },
                            color = Ink,
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Bold,
                        )
                    }
                    IconButton(onClick = onOpenNotifications) {
                        BadgedBox(
                            badge = {
                                if (state.unreadNotifications > 0) {
                                    Badge(containerColor = Forest) {
                                        Text(state.unreadNotifications.coerceAtMost(99).toString())
                                    }
                                }
                            },
                        ) {
                            Icon(Icons.Default.NotificationsNone, "Open notifications", tint = Ink)
                        }
                    }
                }
            }

            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Forest),
                    shape = RoundedCornerShape(28.dp),
                ) {
                    Column(modifier = Modifier.padding(22.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.AutoAwesome, null, tint = Color(0xFFE4D6A5))
                            Spacer(Modifier.width(10.dp))
                            Text("A gentle nudge", color = Color.White, fontWeight = FontWeight.SemiBold)
                        }
                        Spacer(Modifier.height(12.dp))
                        Text(state.insight, color = Color.White.copy(alpha = 0.9f), lineHeight = 22.sp)
                        Spacer(Modifier.height(18.dp))
                        Button(
                            onClick = onOpenChat,
                            colors = ButtonDefaults.buttonColors(containerColor = CardCream, contentColor = Forest),
                            shape = RoundedCornerShape(14.dp),
                        ) {
                            Icon(Icons.Default.ChatBubbleOutline, null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(8.dp))
                            Text("Talk it through")
                        }
                    }
                }
            }

            item {
                Card(shape = RoundedCornerShape(22.dp), colors = CardDefaults.cardColors(CardCream)) {
                    Row(Modifier.fillMaxWidth().padding(18.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.AutoMirrored.Filled.VolumeUp, null, tint = Forest)
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text("Ambient noise monitoring", color = Ink, fontWeight = FontWeight.SemiBold)
                            Text("Use your Sound Sanctuary settings", color = MutedInk, fontSize = 12.sp)
                        }
                        Switch(
                            checked = state.ambientMonitoringEnabled,
                            onCheckedChange = onAmbientMonitoringChange,
                            colors = SwitchDefaults.colors(checkedTrackColor = Forest),
                        )
                    }
                }
            }

            item {
                Text("Your rhythm", color = Ink, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(10.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    MetricCard("Focus", "${state.focusMinutes}m", Icons.Default.Psychology, Modifier.weight(1f))
                    MetricCard("Memories", state.memoriesThisWeek.toString(), Icons.Default.AutoAwesome, Modifier.weight(1f))
                    MetricCard("Streak", "${state.mindfulStreakDays}d", Icons.Default.Insights, Modifier.weight(1f))
                }
            }

            item {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("Recent memories", color = Ink, fontSize = 20.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                    IconButton(onClick = onAddMemory) {
                        Icon(Icons.Default.Add, "Add memory", tint = Forest)
                    }
                }
            }

            if (state.recentMemories.isEmpty()) {
                item {
                    EmptyCard(
                        title = "A quiet place for moments",
                        body = "Save a memory whenever something feels worth keeping.",
                        action = "Add a memory",
                        onAction = onAddMemory,
                    )
                }
            } else {
                items(state.recentMemories, key = { it.memoryId }) { memory ->
                    MemoryCard(memory = memory, onClick = { onOpenMemory(memory) })
                }
            }
        }
    }
}

@Composable
fun NotificationFeedScreen(
    notifications: List<NotificationFeedItem>,
    selectedFilter: NotificationFilter,
    onFilterSelected: (NotificationFilter) -> Unit,
    onMarkRead: (String) -> Unit,
    onDelete: (String) -> Unit,
    onMarkAllRead: () -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val visibleNotifications = notifications.filter { notification ->
        when (selectedFilter) {
            NotificationFilter.All -> true
            NotificationFilter.Unread -> !notification.isRead
            NotificationFilter.Reminders -> notification.kind == NotificationKind.Reminder
            NotificationFilter.Insights -> notification.kind == NotificationKind.Insight
        }
    }

    ScreenSurface(modifier) {
        Column(modifier = Modifier.fillMaxSize()) {
            FeatureHeader(title = "Notifications", onBack = onBack) {
                if (notifications.any { !it.isRead }) {
                    Text(
                        "Read all",
                        color = Forest,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .clickable(onClick = onMarkAllRead)
                            .padding(8.dp),
                    )
                }
            }
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                NotificationFilter.entries.forEach { filter ->
                    FilterChip(
                        selected = selectedFilter == filter,
                        onClick = { onFilterSelected(filter) },
                        label = { Text(filter.label, maxLines = 1) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Forest,
                            selectedLabelColor = Color.White,
                            containerColor = CardCream,
                        ),
                        border = FilterChipDefaults.filterChipBorder(
                            enabled = true,
                            selected = selectedFilter == filter,
                            borderColor = Hairline,
                            selectedBorderColor = Forest,
                        ),
                        modifier = Modifier.weight(1f),
                    )
                }
            }
            Spacer(Modifier.height(12.dp))
            if (visibleNotifications.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize().padding(20.dp), contentAlignment = Alignment.Center) {
                    EmptyCard(
                        title = if (selectedFilter == NotificationFilter.Unread) "You're all caught up" else "Nothing here yet",
                        body = "New reminders and gentle insights will appear here.",
                    )
                }
            } else {
                LazyColumn(
                    contentPadding = androidx.compose.foundation.layout.PaddingValues(start = 20.dp, end = 20.dp, bottom = 24.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    items(visibleNotifications, key = { it.id }) { notification ->
                        NotificationCard(
                            notification = notification,
                            onMarkRead = { onMarkRead(notification.id) },
                            onDelete = { onDelete(notification.id) },
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun SettingsScreen(
    profile: ProfileState,
    preferences: AppPreferences,
    selectedTab: SettingsTab,
    isEditingProfile: Boolean,
    editedName: String,
    editedEmail: String,
    onTabSelected: (SettingsTab) -> Unit,
    onEditProfile: () -> Unit,
    onEditedNameChange: (String) -> Unit,
    onEditedEmailChange: (String) -> Unit,
    onSaveProfile: () -> Unit,
    onCancelEditProfile: () -> Unit,
    onPreferenceChange: (PreferenceMutation) -> Unit,
    onOpenNotifications: () -> Unit,
    onResetPassword: () -> Unit,
    onLogout: () -> Unit,
    onDownloadData: () -> Unit,
    onClearData: () -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    ScreenSurface(modifier) {
        Column(modifier = Modifier.fillMaxSize()) {
            FeatureHeader(title = "Settings", onBack = onBack)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
                    .background(Sage, RoundedCornerShape(16.dp))
                    .padding(4.dp),
            ) {
                SettingsTab.entries.forEach { tab ->
                    val selected = selectedTab == tab
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(12.dp))
                            .background(if (selected) CardCream else Color.Transparent)
                            .clickable { onTabSelected(tab) }
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(
                            tab.label,
                            color = if (selected) Forest else MutedInk,
                            fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
                        )
                    }
                }
            }
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
            ) {
                when (selectedTab) {
                    SettingsTab.Profile -> ProfileSettings(
                        profile = profile,
                        isEditing = isEditingProfile,
                        editedName = editedName,
                        editedEmail = editedEmail,
                        onEdit = onEditProfile,
                        onNameChange = onEditedNameChange,
                        onEmailChange = onEditedEmailChange,
                        onSave = onSaveProfile,
                        onCancel = onCancelEditProfile,
                        preferences = preferences,
                        onPreferenceChange = onPreferenceChange,
                        onOpenNotifications = onOpenNotifications,
                        onResetPassword = onResetPassword,
                        onLogout = onLogout,
                    )
                    SettingsTab.Alerts -> AlertSettings(preferences, onPreferenceChange)
                    SettingsTab.Privacy -> PrivacySettings(preferences, onPreferenceChange, onDownloadData, onClearData)
                }
            }
        }
    }
}

@Composable
private fun MetricCard(label: String, value: String, icon: ImageVector, modifier: Modifier = Modifier) {
    Card(modifier = modifier, shape = RoundedCornerShape(20.dp), colors = CardDefaults.cardColors(CardCream)) {
        Column(modifier = Modifier.padding(14.dp)) {
            Icon(icon, null, tint = Moss, modifier = Modifier.size(20.dp))
            Spacer(Modifier.height(14.dp))
            Text(value, color = Ink, fontSize = 22.sp, fontWeight = FontWeight.Bold)
            Text(label, color = MutedInk, fontSize = 12.sp, maxLines = 1)
        }
    }
}

@Composable
private fun MemoryCard(memory: ApiMemory, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.cardColors(CardCream),
    ) {
        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier.size(48.dp).background(Sage, RoundedCornerShape(15.dp)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(Icons.Default.AutoAwesome, null, tint = Forest)
            }
            Spacer(Modifier.width(14.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(memory.title, color = Ink, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                if (!memory.description.isNullOrBlank()) {
                    Text(memory.description, color = MutedInk, fontSize = 13.sp, maxLines = 2, overflow = TextOverflow.Ellipsis)
                }
            }
            Icon(Icons.Default.ChevronRight, null, tint = Moss)
        }
    }
}

@Composable
private fun NotificationCard(
    notification: NotificationFeedItem,
    onMarkRead: () -> Unit,
    onDelete: () -> Unit,
) {
    val icon = when (notification.kind) {
        NotificationKind.Reminder -> Icons.Default.NotificationsNone
        NotificationKind.Insight -> Icons.Default.Insights
        NotificationKind.Update -> Icons.Default.AutoAwesome
    }
    Card(
        colors = CardDefaults.cardColors(if (notification.isRead) CardCream else Sage),
        shape = RoundedCornerShape(22.dp),
    ) {
        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.Top) {
            Box(
                modifier = Modifier.size(42.dp).background(if (notification.isRead) Sage else CardCream, CircleShape),
                contentAlignment = Alignment.Center,
            ) {
                Icon(icon, null, tint = Forest, modifier = Modifier.size(21.dp))
            }
            Spacer(Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(notification.title, color = Ink, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                    if (!notification.isRead) {
                        Box(Modifier.size(8.dp).background(Forest, CircleShape))
                    }
                }
                Spacer(Modifier.height(3.dp))
                Text(notification.message, color = MutedInk, fontSize = 13.sp, lineHeight = 18.sp)
                Spacer(Modifier.height(9.dp))
                Text(notification.timeLabel, color = Moss, fontSize = 12.sp)
            }
            Column {
                if (!notification.isRead) {
                    IconButton(onClick = onMarkRead, modifier = Modifier.size(36.dp)) {
                        Icon(Icons.Default.MarkEmailRead, "Mark as read", tint = Forest, modifier = Modifier.size(19.dp))
                    }
                }
                IconButton(onClick = onDelete, modifier = Modifier.size(36.dp)) {
                    Icon(Icons.Default.DeleteOutline, "Delete notification", tint = Color(0xFF9B625A), modifier = Modifier.size(19.dp))
                }
            }
        }
    }
}

@Composable
private fun ProfileSettings(
    profile: ProfileState,
    isEditing: Boolean,
    editedName: String,
    editedEmail: String,
    onEdit: () -> Unit,
    onNameChange: (String) -> Unit,
    onEmailChange: (String) -> Unit,
    onSave: () -> Unit,
    onCancel: () -> Unit,
    preferences: AppPreferences,
    onPreferenceChange: (PreferenceMutation) -> Unit,
    onOpenNotifications: () -> Unit,
    onResetPassword: () -> Unit,
    onLogout: () -> Unit,
) {
    SettingsCard {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(68.dp).background(Sage, CircleShape), contentAlignment = Alignment.Center) {
                Text(
                    profile.name.trim().firstOrNull()?.uppercase() ?: "N",
                    color = Forest,
                    fontSize = 26.sp,
                    fontWeight = FontWeight.Bold,
                )
            }
            Spacer(Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(profile.name.ifBlank { "Your profile" }, color = Ink, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Text(profile.email, color = MutedInk, fontSize = 13.sp)
                if (profile.memberSince.isNotBlank()) Text("Member since ${profile.memberSince}", color = Moss, fontSize = 12.sp)
            }
            if (!isEditing) {
                IconButton(onClick = onEdit) { Icon(Icons.Default.Edit, "Edit profile", tint = Forest) }
            }
        }
    }
    if (isEditing) {
        SettingsCard {
            Text("Edit profile", color = Ink, fontSize = 18.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(14.dp))
            OutlinedTextField(
                value = editedName,
                onValueChange = onNameChange,
                label = { Text("Name") },
                leadingIcon = { Icon(Icons.Default.Person, null) },
                singleLine = true,
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(Modifier.height(10.dp))
            OutlinedTextField(
                value = editedEmail,
                onValueChange = onEmailChange,
                label = { Text("Email") },
                leadingIcon = { Icon(Icons.Default.Email, null) },
                singleLine = true,
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.fillMaxWidth(),
                enabled = false,
            )
            Spacer(Modifier.height(16.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedButton(onClick = onCancel, shape = RoundedCornerShape(14.dp), modifier = Modifier.weight(1f)) {
                    Icon(Icons.Default.Close, null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(6.dp))
                    Text("Cancel")
                }
                Button(
                    onClick = onSave,
                    enabled = editedName.isNotBlank(),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Forest),
                    modifier = Modifier.weight(1f),
                ) {
                    Icon(Icons.Default.Check, null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(6.dp))
                    Text("Save")
                }
            }
        }
    }
    SettingsCard {
        Text("Appearance", color = Ink, fontSize = 18.sp, fontWeight = FontWeight.Bold)
        SettingToggleRow(
            icon = Icons.Default.DarkMode,
            title = "Dark mode",
            subtitle = "Use a darker, low-light palette",
            checked = preferences.darkMode,
        ) {
            onPreferenceChange(PreferenceMutation.BooleanValue(PreferenceField.DarkMode, it))
        }
    }
    SettingsCard {
        Text("Account", color = Ink, fontSize = 18.sp, fontWeight = FontWeight.Bold)
        OutlinedButton(onClick = onOpenNotifications, modifier = Modifier.fillMaxWidth()) { Text("Notifications") }
        OutlinedButton(onClick = onResetPassword, modifier = Modifier.fillMaxWidth()) { Text("Reset password") }
        OutlinedButton(onClick = onLogout, modifier = Modifier.fillMaxWidth()) { Text("Sign out") }
    }
}

@Composable
private fun AlertSettings(preferences: AppPreferences, onChange: (PreferenceMutation) -> Unit) {
    SettingsCard {
        SectionHeading(Icons.AutoMirrored.Filled.VolumeUp, "Sound awareness", "Tune how NeuroNudge responds to your surroundings.")
        SettingToggleRow(Icons.Default.Mic, "Ambient monitoring", "Measure nearby sound levels", preferences.ambientEnabled) {
            onChange(PreferenceMutation.BooleanValue(PreferenceField.AmbientEnabled, it))
        }
        Text("Alert threshold: ${preferences.threshold} dB", color = Ink, fontWeight = FontWeight.SemiBold)
        Slider(
            value = preferences.threshold.toFloat(),
            onValueChange = { onChange(PreferenceMutation.IntValue(PreferenceField.Threshold, it.toInt())) },
            valueRange = 40f..100f,
        )
        Text("Sustain for ${preferences.sustainSeconds} seconds before alerting", color = MutedInk, fontSize = 13.sp)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf(1, 2, 5, 10).forEach { seconds ->
                FilterChip(
                    selected = preferences.sustainSeconds == seconds,
                    onClick = { onChange(PreferenceMutation.IntValue(PreferenceField.SustainSeconds, seconds)) },
                    label = { Text("${seconds}s") },
                )
            }
        }
    }
    SettingsCard {
        SectionHeading(Icons.Default.NotificationsNone, "Notifications", "Choose the alerts that are useful to you.")
        SettingToggleRow(Icons.AutoMirrored.Filled.VolumeUp, "Threshold alerts", "Notify when your sound limit is reached", preferences.thresholdAlerts) {
            onChange(PreferenceMutation.BooleanValue(PreferenceField.ThresholdAlerts, it))
        }
        SettingToggleRow(Icons.Default.Insights, "Daily summary", "A short recap every day at 8:00 AM", preferences.dailySummary) {
            onChange(PreferenceMutation.BooleanValue(PreferenceField.DailySummary, it))
        }
        SettingToggleRow(Icons.Default.NotificationsNone, "Push notifications", "Allow alerts outside the app", preferences.pushNotifications) {
            onChange(PreferenceMutation.BooleanValue(PreferenceField.PushNotifications, it))
        }
    }
}

@Composable
private fun PrivacySettings(
    preferences: AppPreferences,
    onChange: (PreferenceMutation) -> Unit,
    onDownloadData: () -> Unit,
    onClearData: () -> Unit,
) {
    var confirmClear by androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf(false) }
    SettingsCard {
        SectionHeading(Icons.Default.Shield, "Device permissions", "You stay in control of what the app can use.")
        SettingToggleRow(Icons.Default.LocationOn, "Location", "Attach places to memories", preferences.locationAccess) {
            onChange(PreferenceMutation.BooleanValue(PreferenceField.LocationAccess, it))
        }
        SettingToggleRow(Icons.Default.Mic, "Microphone", "Support ambient sound awareness", preferences.microphoneAccess) {
            onChange(PreferenceMutation.BooleanValue(PreferenceField.MicrophoneAccess, it))
        }
        SettingToggleRow(Icons.Default.CameraAlt, "Camera", "Capture photos for memories", preferences.cameraAccess) {
            onChange(PreferenceMutation.BooleanValue(PreferenceField.CameraAccess, it))
        }
        SettingToggleRow(Icons.Default.Bluetooth, "Bluetooth", "Connect supported wellness devices", preferences.bluetoothAccess) {
            onChange(PreferenceMutation.BooleanValue(PreferenceField.BluetoothAccess, it))
        }
    }
    SettingsCard {
        SectionHeading(Icons.Default.Tune, "Data choices", "Control how your activity supports the experience.")
        SettingToggleRow(Icons.Default.Insights, "Personalized insights", "Use your activity for tailored nudges", preferences.personalizedInsights) {
            onChange(PreferenceMutation.BooleanValue(PreferenceField.PersonalizedInsights, it))
        }
        SettingToggleRow(Icons.Default.Shield, "Share usage data", "Send anonymous product analytics", preferences.shareUsageData) {
            onChange(PreferenceMutation.BooleanValue(PreferenceField.ShareUsageData, it))
        }
    }
    Card(colors = CardDefaults.cardColors(SoftRose), shape = RoundedCornerShape(18.dp)) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Your data", color = Color(0xFF744D47), fontWeight = FontWeight.Bold)
            OutlinedButton(onClick = onDownloadData, modifier = Modifier.fillMaxWidth()) { Text("Download data") }
            Button(onClick = { confirmClear = true }, modifier = Modifier.fillMaxWidth(), colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF9B625A))) {
                Text("Clear memories and chat")
            }
        }
    }
    if (confirmClear) {
        AlertDialog(
            onDismissRequest = { confirmClear = false },
            title = { Text("Clear your data?") },
            text = { Text("This permanently deletes your memories and chat history from NeuroNudge.") },
            confirmButton = { TextButton(onClick = { confirmClear = false; onClearData() }) { Text("Clear data") } },
            dismissButton = { TextButton(onClick = { confirmClear = false }) { Text("Cancel") } },
        )
    }
}

@Composable
private fun SettingToggleRow(
    icon: ImageVector,
    title: String,
    subtitle: String,
    checked: Boolean,
    enabled: Boolean = true,
    onCheckedChange: (Boolean) -> Unit,
) {
    Row(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(38.dp).background(Sage, RoundedCornerShape(12.dp)), contentAlignment = Alignment.Center) {
            Icon(icon, null, tint = Forest, modifier = Modifier.size(19.dp))
        }
        Spacer(Modifier.width(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(title, color = Ink, fontWeight = FontWeight.SemiBold)
            Text(subtitle, color = MutedInk, fontSize = 12.sp, lineHeight = 16.sp)
        }
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            enabled = enabled,
            colors = SwitchDefaults.colors(checkedThumbColor = CardCream, checkedTrackColor = Forest),
        )
    }
}

@Composable
private fun SectionHeading(icon: ImageVector, title: String, subtitle: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, null, tint = Forest)
        Spacer(Modifier.width(10.dp))
        Text(title, color = Ink, fontSize = 18.sp, fontWeight = FontWeight.Bold)
    }
    Spacer(Modifier.height(4.dp))
    Text(subtitle, color = MutedInk, fontSize = 13.sp)
    Spacer(Modifier.height(8.dp))
}

@Composable
private fun SettingsCard(content: @Composable ColumnScope.() -> Unit) {
    Card(shape = RoundedCornerShape(22.dp), colors = CardDefaults.cardColors(CardCream)) {
        Column(modifier = Modifier.padding(18.dp), content = content)
    }
}

@Composable
private fun EmptyCard(title: String, body: String, action: String? = null, onAction: () -> Unit = {}) {
    Card(shape = RoundedCornerShape(22.dp), colors = CardDefaults.cardColors(CardCream)) {
        Column(modifier = Modifier.fillMaxWidth().padding(22.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Box(Modifier.size(52.dp).background(Sage, CircleShape), contentAlignment = Alignment.Center) {
                Icon(Icons.Default.AutoAwesome, null, tint = Forest)
            }
            Spacer(Modifier.height(12.dp))
            Text(title, color = Ink, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(4.dp))
            Text(body, color = MutedInk, fontSize = 13.sp, lineHeight = 18.sp)
            if (action != null) {
                Spacer(Modifier.height(14.dp))
                Button(onClick = onAction, colors = ButtonDefaults.buttonColors(containerColor = Forest), shape = RoundedCornerShape(14.dp)) {
                    Text(action)
                }
            }
        }
    }
}

@Composable
private fun FeatureHeader(title: String, onBack: () -> Unit, action: @Composable () -> Unit = {}) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(start = 8.dp, end = 20.dp, top = 12.dp, bottom = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back", tint = Ink) }
        Text(title, color = Ink, fontSize = 24.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
        action()
    }
}

@Composable
private fun ScreenSurface(modifier: Modifier, content: @Composable () -> Unit) {
    Surface(modifier = modifier.fillMaxSize(), color = Canvas, content = content)
}
