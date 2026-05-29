package com.datawatch.android.utils

object FormatUtils {
    fun formatBytes(bytes: Long): String {
        return when {
            bytes >= 1024L * 1024L * 1024L -> String.format("%.2f GB", bytes / (1024.0 * 1024.0 * 1024.0))
            bytes >= 1024L * 1024L -> String.format("%.1f MB", bytes / (1024.0 * 1024.0))
            bytes >= 1024L -> String.format("%.1f KB", bytes / 1024.0)
            else -> "$bytes B"
        }
    }

    fun formatMB(mb: Float): String {
        return when {
            mb >= 1024f -> String.format("%.2f GB", mb / 1024f)
            else -> String.format("%.1f MB", mb)
        }
    }
}
