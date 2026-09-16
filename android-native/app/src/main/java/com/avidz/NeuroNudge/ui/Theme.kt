package com.avidz.NeuroNudge.ui

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import com.avidz.NeuroNudge.R

private val Forest = Color(0xFF496A57)
private val ForestDark = Color(0xFF173D2C)
private val Sage = Color(0xFFAFC8B5)
private val Cream = Color(0xFFF8F3E8)
private val WarmWhite = Color(0xFFFFFBF3)
private val Ink = Color(0xFF243129)
private val Clay = Color(0xFF9E5B4F)

private val LightColors = lightColorScheme(
    primary = Forest,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFD6E8D8),
    onPrimaryContainer = ForestDark,
    secondary = Color(0xFF6D7D61),
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFE2E8D5),
    onSecondaryContainer = Color(0xFF293321),
    background = Cream,
    onBackground = Ink,
    surface = WarmWhite,
    onSurface = Ink,
    surfaceVariant = Color(0xFFEDE7DB),
    onSurfaceVariant = Color(0xFF60675F),
    outline = Color(0xFF879087),
    error = Clay,
    onError = Color.White,
    errorContainer = Color(0xFFFFDAD4),
    onErrorContainer = Color(0xFF3E0805),
)

private val DarkColors = darkColorScheme(
    primary = Sage,
    onPrimary = Color(0xFF173A27),
    primaryContainer = Color(0xFF31513E),
    onPrimaryContainer = Color(0xFFD6E8D8),
    secondary = Color(0xFFC4CEB5),
    onSecondary = Color(0xFF30382A),
    secondaryContainer = Color(0xFF464F3F),
    onSecondaryContainer = Color(0xFFE1E8D7),
    background = Color(0xFF171C18),
    onBackground = Color(0xFFE5EAE3),
    surface = Color(0xFF1E241F),
    onSurface = Color(0xFFE5EAE3),
    surfaceVariant = Color(0xFF3E463F),
    onSurfaceVariant = Color(0xFFC2C9C1),
    outline = Color(0xFF8C958D),
    error = Color(0xFFFFB4A9),
    onError = Color(0xFF680003),
    errorContainer = Color(0xFF873B32),
    onErrorContainer = Color(0xFFFFDAD4),
)

private val Poppins = FontFamily(Font(R.font.poppins_regular))
private val Defaults = Typography()

private fun TextStyle.poppins() = copy(fontFamily = Poppins)

private val NeuroNudgeTypography = Typography(
    displayLarge = Defaults.displayLarge.poppins(),
    displayMedium = Defaults.displayMedium.poppins(),
    displaySmall = Defaults.displaySmall.poppins(),
    headlineLarge = Defaults.headlineLarge.poppins(),
    headlineMedium = Defaults.headlineMedium.poppins(),
    headlineSmall = Defaults.headlineSmall.poppins(),
    titleLarge = Defaults.titleLarge.poppins(),
    titleMedium = Defaults.titleMedium.poppins(),
    titleSmall = Defaults.titleSmall.poppins(),
    bodyLarge = Defaults.bodyLarge.poppins(),
    bodyMedium = Defaults.bodyMedium.poppins(),
    bodySmall = Defaults.bodySmall.poppins(),
    labelLarge = Defaults.labelLarge.poppins(),
    labelMedium = Defaults.labelMedium.poppins(),
    labelSmall = Defaults.labelSmall.poppins(),
)

@Composable
fun NeuroNudgeTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        typography = NeuroNudgeTypography,
        content = content,
    )
}
