package com.harmes.videoai

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = androidx.compose.ui.graphics.Color(0xFF8B5CF6),
    secondary = androidx.compose.ui.graphics.Color(0xFF22D3EE),
    tertiary = androidx.compose.ui.graphics.Color(0xFFF59E0B)
)

@Composable
fun HarmesTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = MaterialTheme.typography,
        content = content
    )
}
