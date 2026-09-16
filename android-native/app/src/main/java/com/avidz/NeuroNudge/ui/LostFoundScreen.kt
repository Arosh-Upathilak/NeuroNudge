package com.avidz.NeuroNudge.ui

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.Image
import androidx.compose.material.icons.outlined.LocationOn
import androidx.compose.material.icons.outlined.Mic
import androidx.compose.material.icons.outlined.PhotoCamera
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material.icons.rounded.Send
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import com.avidz.NeuroNudge.data.ApiMemory
import com.avidz.NeuroNudge.data.ChatItem
import com.avidz.NeuroNudge.data.NlpMemory

enum class LostFoundMode {
    Chat,
    Memories,
}

@Composable
fun LostFoundScreen(
    chatItems: List<ChatItem>,
    memories: List<ApiMemory>,
    messageText: String,
    onMessageTextChange: (String) -> Unit,
    onSendMessage: (message: String, imageUri: String?) -> Unit,
    onCameraClick: () -> Unit,
    onSpeechClick: () -> Unit,
    onOpenMap: (latitude: Double, longitude: Double) -> Unit,
    modifier: Modifier = Modifier,
    mode: LostFoundMode = LostFoundMode.Chat,
    onModeChange: (LostFoundMode) -> Unit = {},
    searchQuery: String = "",
    onSearchQueryChange: (String) -> Unit = {},
    imagePreviewUri: String? = null,
    onRemoveImage: () -> Unit = {},
    isListening: Boolean = false,
    isLoadingMemories: Boolean = false,
) {
    val colors = MaterialTheme.colorScheme

    Surface(
        modifier = modifier.fillMaxSize(),
        color = colors.background,
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .windowInsetsPadding(WindowInsets.navigationBars)
                .imePadding()
                .padding(horizontal = 18.dp),
        ) {
            Spacer(Modifier.height(16.dp))
            LostFoundModePicker(
                mode = mode,
                onModeChange = onModeChange,
            )
            Spacer(Modifier.height(22.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.Bottom,
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Column {
                    Text(
                        text = if (mode == LostFoundMode.Chat) "Lost to Found" else "Your memories",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.SemiBold,
                        color = colors.onBackground,
                    )
                    Text(
                        text = if (mode == LostFoundMode.Chat) {
                            "Ask gently. Remember together."
                        } else {
                            "Small moments, safely kept"
                        },
                        style = MaterialTheme.typography.bodyMedium,
                        color = colors.onSurfaceVariant,
                    )
                }
                if (mode == LostFoundMode.Memories) {
                    Text(
                        text = "${memories.size} saved",
                        style = MaterialTheme.typography.labelMedium,
                        color = colors.primary,
                    )
                }
            }
            Spacer(Modifier.height(14.dp))

            when (mode) {
                LostFoundMode.Chat -> ChatContent(
                    chatItems = chatItems,
                    messageText = messageText,
                    onMessageTextChange = onMessageTextChange,
                    onSendMessage = onSendMessage,
                    onCameraClick = onCameraClick,
                    onSpeechClick = onSpeechClick,
                    onOpenMap = onOpenMap,
                    imagePreviewUri = imagePreviewUri,
                    onRemoveImage = onRemoveImage,
                    isListening = isListening,
                    modifier = Modifier.weight(1f),
                )

                LostFoundMode.Memories -> MemoriesContent(
                    memories = memories,
                    searchQuery = searchQuery,
                    onSearchQueryChange = onSearchQueryChange,
                    onOpenMap = onOpenMap,
                    isLoading = isLoadingMemories,
                    modifier = Modifier.weight(1f),
                )
            }
        }
    }
}

@Composable
private fun LostFoundModePicker(
    mode: LostFoundMode,
    onModeChange: (LostFoundMode) -> Unit,
) {
    val colors = MaterialTheme.colorScheme
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        color = colors.surfaceVariant,
    ) {
        Row(Modifier.padding(4.dp)) {
            LostFoundMode.entries.forEach { item ->
                val selected = item == mode
                Surface(
                    modifier = Modifier
                        .weight(1f)
                        .height(44.dp)
                        .clickable(role = Role.Tab) { onModeChange(item) },
                    shape = RoundedCornerShape(14.dp),
                    color = if (selected) colors.primary else Color.Transparent,
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(
                            text = if (item == LostFoundMode.Chat) "Chat" else "Memories",
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Medium,
                            color = if (selected) colors.onPrimary else colors.onSurfaceVariant,
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ChatContent(
    chatItems: List<ChatItem>,
    messageText: String,
    onMessageTextChange: (String) -> Unit,
    onSendMessage: (String, String?) -> Unit,
    onCameraClick: () -> Unit,
    onSpeechClick: () -> Unit,
    onOpenMap: (Double, Double) -> Unit,
    imagePreviewUri: String?,
    onRemoveImage: () -> Unit,
    isListening: Boolean,
    modifier: Modifier = Modifier,
) {
    val listState = rememberLazyListState()

    LaunchedEffect(chatItems.size) {
        if (chatItems.isNotEmpty()) listState.animateScrollToItem(chatItems.lastIndex)
    }

    Column(modifier = modifier) {
        if (chatItems.isEmpty()) {
            ChatWelcome(Modifier.weight(1f))
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                state = listState,
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                items(chatItems, key = { it.id }) { item ->
                    ChatBubble(item = item, onOpenMap = onOpenMap)
                }
                item { Spacer(Modifier.height(4.dp)) }
            }
        }

        imagePreviewUri?.let {
            ImagePreview(uri = it, onRemove = onRemoveImage)
            Spacer(Modifier.height(8.dp))
        }
        MessageComposer(
            messageText = messageText,
            onMessageTextChange = onMessageTextChange,
            onSendMessage = { onSendMessage(messageText.trim(), imagePreviewUri) },
            onCameraClick = onCameraClick,
            onSpeechClick = onSpeechClick,
            isListening = isListening,
            canSend = messageText.isNotBlank(),
        )
        Spacer(Modifier.height(10.dp))
    }
}

@Composable
private fun ChatWelcome(modifier: Modifier = Modifier) {
    val colors = MaterialTheme.colorScheme
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Surface(
            modifier = Modifier.size(64.dp),
            shape = CircleShape,
            color = colors.primaryContainer,
        ) {
            Box(contentAlignment = Alignment.Center) {
                Icon(
                    imageVector = Icons.Outlined.Search,
                    contentDescription = null,
                    tint = colors.onPrimaryContainer,
                    modifier = Modifier.size(28.dp),
                )
            }
        }
        Spacer(Modifier.height(14.dp))
        Text(
            text = "What are you looking for?",
            style = MaterialTheme.typography.titleMedium,
            color = colors.onSurface,
        )
        Text(
            text = "Describe a person, place, object, or moment.",
            style = MaterialTheme.typography.bodyMedium,
            color = colors.onSurfaceVariant,
        )
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun ChatBubble(
    item: ChatItem,
    onOpenMap: (Double, Double) -> Unit,
) {
    val colors = MaterialTheme.colorScheme
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = if (item.fromUser) Alignment.End else Alignment.Start,
    ) {
        Surface(
            modifier = Modifier.fillMaxWidth(if (item.fromUser) 0.82f else 0.9f),
            shape = RoundedCornerShape(
                topStart = 20.dp,
                topEnd = 20.dp,
                bottomStart = if (item.fromUser) 20.dp else 5.dp,
                bottomEnd = if (item.fromUser) 5.dp else 20.dp,
            ),
            color = if (item.fromUser) colors.primary else colors.surfaceVariant,
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                if (item.pending) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(17.dp),
                        strokeWidth = 2.dp,
                        color = if (item.fromUser) colors.onPrimary else colors.primary,
                    )
                    Spacer(Modifier.size(9.dp))
                }
                Text(
                    text = item.text.ifBlank { if (item.pending) "Thinking..." else "" },
                    style = MaterialTheme.typography.bodyLarge,
                    color = if (item.fromUser) colors.onPrimary else colors.onSurfaceVariant,
                )
            }
        }

        if (item.memories.isNotEmpty()) {
            Spacer(Modifier.height(8.dp))
            FlowRow(
                modifier = Modifier.fillMaxWidth(0.94f),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
                maxItemsInEachRow = 2,
            ) {
                item.memories.forEach { memory ->
                    NlpMemoryWidget(
                        memory = memory,
                        onOpenMap = onOpenMap,
                        modifier = Modifier.weight(1f),
                    )
                }
            }
        }
    }
}

@Composable
private fun NlpMemoryWidget(
    memory: NlpMemory,
    onOpenMap: (Double, Double) -> Unit,
    modifier: Modifier = Modifier,
) {
    MemorySurface(
        title = memory.title,
        description = memory.description,
        imageUrl = memory.imageUrl,
        createdAt = memory.createdAt ?: memory.createdat,
        latitude = memory.latitude,
        longitude = memory.longitude,
        onOpenMap = onOpenMap,
        compact = true,
        modifier = modifier,
    )
}

@Composable
private fun MemoriesContent(
    memories: List<ApiMemory>,
    searchQuery: String,
    onSearchQueryChange: (String) -> Unit,
    onOpenMap: (Double, Double) -> Unit,
    isLoading: Boolean,
    modifier: Modifier = Modifier,
) {
    val filtered = memories.filter { memory ->
        searchQuery.isBlank() ||
            memory.title.contains(searchQuery, ignoreCase = true) ||
            memory.description?.contains(searchQuery, ignoreCase = true) == true
    }

    Column(modifier = modifier) {
        SearchField(query = searchQuery, onQueryChange = onSearchQueryChange)
        Spacer(Modifier.height(12.dp))

        when {
            isLoading && memories.isEmpty() -> Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center,
            ) {
                CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
            }

            filtered.isEmpty() -> EmptyMemories(hasSearch = searchQuery.isNotBlank())

            else -> LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                items(filtered, key = { it.memoryId }) { memory ->
                    MemorySurface(
                        title = memory.title,
                        description = memory.description,
                        imageUrl = memory.image?.imageUrl,
                        createdAt = memory.createdAt,
                        latitude = memory.location?.latitude,
                        longitude = memory.location?.longitude,
                        onOpenMap = onOpenMap,
                    )
                }
                item { Spacer(Modifier.height(12.dp)) }
            }
        }
    }
}

@Composable
private fun SearchField(
    query: String,
    onQueryChange: (String) -> Unit,
) {
    val colors = MaterialTheme.colorScheme
    TextField(
        value = query,
        onValueChange = onQueryChange,
        modifier = Modifier.fillMaxWidth(),
        placeholder = { Text("Search stored memories") },
        leadingIcon = { Icon(Icons.Outlined.Search, contentDescription = null) },
        trailingIcon = if (query.isNotEmpty()) {
            {
                IconButton(onClick = { onQueryChange("") }) {
                    Icon(Icons.Outlined.Close, contentDescription = "Clear search")
                }
            }
        } else {
            null
        },
        singleLine = true,
        shape = RoundedCornerShape(18.dp),
        colors = TextFieldDefaults.colors(
            focusedContainerColor = colors.surfaceVariant,
            unfocusedContainerColor = colors.surfaceVariant,
            focusedIndicatorColor = Color.Transparent,
            unfocusedIndicatorColor = Color.Transparent,
        ),
    )
}

@Composable
private fun EmptyMemories(hasSearch: Boolean) {
    val colors = MaterialTheme.colorScheme
    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Icon(
            imageVector = if (hasSearch) Icons.Outlined.Search else Icons.Outlined.Image,
            contentDescription = null,
            modifier = Modifier.size(42.dp),
            tint = colors.primary,
        )
        Spacer(Modifier.height(10.dp))
        Text(
            text = if (hasSearch) "No matching memories" else "No memories saved yet",
            style = MaterialTheme.typography.titleMedium,
            color = colors.onSurface,
        )
        Text(
            text = if (hasSearch) "Try a different word." else "Your remembered moments will appear here.",
            style = MaterialTheme.typography.bodyMedium,
            color = colors.onSurfaceVariant,
        )
    }
}

@Composable
private fun MemorySurface(
    title: String,
    description: String?,
    imageUrl: String?,
    createdAt: String?,
    latitude: Double?,
    longitude: Double?,
    onOpenMap: (Double, Double) -> Unit,
    modifier: Modifier = Modifier,
    compact: Boolean = false,
) {
    val colors = MaterialTheme.colorScheme
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = colors.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
    ) {
        Column {
            if (imageUrl != null) {
                AsyncImage(
                    model = imageUrl,
                    contentDescription = title,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(if (compact) 92.dp else 168.dp),
                    contentScale = ContentScale.Crop,
                )
            } else {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(if (compact) 68.dp else 96.dp)
                        .background(colors.primaryContainer),
                    contentAlignment = Alignment.Center,
                ) {
                    Image(
                        imageVector = Icons.Outlined.Image,
                        contentDescription = null,
                        modifier = Modifier.size(if (compact) 28.dp else 36.dp),
                        colorFilter = ColorFilter.tint(colors.onPrimaryContainer),
                    )
                }
            }

            Column(Modifier.padding(if (compact) 10.dp else 16.dp)) {
                Text(
                    text = title,
                    style = if (compact) MaterialTheme.typography.titleSmall else MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = colors.onSurface,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
                if (!description.isNullOrBlank()) {
                    Spacer(Modifier.height(4.dp))
                    Text(
                        text = description,
                        style = if (compact) MaterialTheme.typography.bodySmall else MaterialTheme.typography.bodyMedium,
                        color = colors.onSurfaceVariant,
                        maxLines = if (compact) 2 else 3,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
                if (!createdAt.isNullOrBlank()) {
                    Spacer(Modifier.height(8.dp))
                    Text(
                        text = readableDate(createdAt),
                        style = MaterialTheme.typography.labelSmall,
                        color = colors.onSurfaceVariant,
                    )
                }
                if (latitude != null && longitude != null) {
                    if (!compact) {
                        Spacer(Modifier.height(10.dp))
                        HorizontalDivider(color = colors.outlineVariant)
                    }
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onOpenMap(latitude, longitude) }
                            .padding(top = 9.dp, bottom = if (compact) 0.dp else 2.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.LocationOn,
                            contentDescription = null,
                            modifier = Modifier.size(17.dp),
                            tint = colors.primary,
                        )
                        Spacer(Modifier.size(5.dp))
                        Text(
                            text = "Open location",
                            style = MaterialTheme.typography.labelMedium,
                            color = colors.primary,
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ImagePreview(
    uri: String,
    onRemove: () -> Unit,
) {
    val colors = MaterialTheme.colorScheme
    Box(
        modifier = Modifier
            .size(88.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(colors.surfaceVariant),
    ) {
        AsyncImage(
            model = uri,
            contentDescription = "Selected image",
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop,
        )
        Surface(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(5.dp)
                .size(26.dp),
            shape = CircleShape,
            color = colors.scrim.copy(alpha = 0.72f),
        ) {
            IconButton(onClick = onRemove) {
                Icon(
                    imageVector = Icons.Outlined.Close,
                    contentDescription = "Remove selected image",
                    modifier = Modifier.size(15.dp),
                    tint = Color.White,
                )
            }
        }
    }
}

@Composable
private fun MessageComposer(
    messageText: String,
    onMessageTextChange: (String) -> Unit,
    onSendMessage: () -> Unit,
    onCameraClick: () -> Unit,
    onSpeechClick: () -> Unit,
    isListening: Boolean,
    canSend: Boolean,
) {
    val colors = MaterialTheme.colorScheme
    val focusManager = LocalFocusManager.current

    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.Bottom,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        TextField(
            value = messageText,
            onValueChange = onMessageTextChange,
            modifier = Modifier.weight(1f),
            placeholder = {
                Text(if (isListening) "Listening..." else "What are you looking for?")
            },
            leadingIcon = {
                IconButton(onClick = onCameraClick) {
                    Icon(Icons.Outlined.PhotoCamera, contentDescription = "Add a photo")
                }
            },
            maxLines = 4,
            shape = RoundedCornerShape(22.dp),
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
            keyboardActions = KeyboardActions(onSend = {
                if (canSend) {
                    onSendMessage()
                    focusManager.clearFocus()
                }
            }),
            colors = TextFieldDefaults.colors(
                focusedContainerColor = colors.surfaceVariant,
                unfocusedContainerColor = colors.surfaceVariant,
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent,
            ),
        )

        Surface(
            modifier = Modifier.size(52.dp),
            shape = CircleShape,
            color = if (isListening) colors.errorContainer else colors.secondaryContainer,
        ) {
            IconButton(onClick = onSpeechClick) {
                Icon(
                    imageVector = Icons.Outlined.Mic,
                    contentDescription = if (isListening) "Stop listening" else "Start speech input",
                    tint = if (isListening) colors.onErrorContainer else colors.onSecondaryContainer,
                )
            }
        }

        Surface(
            modifier = Modifier.size(52.dp),
            shape = CircleShape,
            color = if (canSend) colors.primary else colors.surfaceVariant,
        ) {
            IconButton(
                enabled = canSend,
                onClick = {
                    onSendMessage()
                    focusManager.clearFocus()
                },
            ) {
                Icon(
                    imageVector = Icons.Rounded.Send,
                    contentDescription = "Send message",
                    modifier = Modifier.size(21.dp),
                    tint = if (canSend) colors.onPrimary else colors.onSurfaceVariant,
                )
            }
        }
    }
}

private fun readableDate(value: String): String {
    val date = value.substringBefore('T')
    return if (date.length == 10 && date[4] == '-' && date[7] == '-') {
        "${date.substring(8, 10)}/${date.substring(5, 7)}/${date.substring(0, 4)}"
    } else {
        value
    }
}
