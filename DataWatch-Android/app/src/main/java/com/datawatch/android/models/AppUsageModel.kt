package com.datawatch.android.models

import android.graphics.drawable.Drawable

// FIX 2: WiFi removed entirely. This model tracks Safaricom cellular data only.
data class AppUsageModel(
    val packageName: String,
    val appName: String,
    val appIcon: Drawable?,
    val cellularBytes: Long,    // total cellular (rx + tx)
    val activeBytes: Long,      // cellular used while app was in foreground
    val backgroundBytes: Long,  // cellular used while app was in background
    val lastUpdated: Long = System.currentTimeMillis()
) {
    val totalBytes: Long get() = cellularBytes
    val totalMB: Float get() = cellularBytes / (1024f * 1024f)
    val activeMB: Float get() = activeBytes / (1024f * 1024f)
    val backgroundMB: Float get() = backgroundBytes / (1024f * 1024f)
}
