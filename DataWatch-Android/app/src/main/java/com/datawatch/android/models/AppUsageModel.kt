package com.datawatch.android.models

import android.graphics.drawable.Drawable

data class AppUsageModel(
    val packageName: String,
    val appName: String,
    val appIcon: Drawable?,
    val totalBytes: Long,
    val cellularBytes: Long,
    val wifiBytes: Long,
    val foregroundBytes: Long,
    val backgroundBytes: Long,
    val lastUpdated: Long = System.currentTimeMillis()
) {
    val totalMB: Float get() = totalBytes / (1024f * 1024f)
    val cellularMB: Float get() = cellularBytes / (1024f * 1024f)
    val wifiMB: Float get() = wifiBytes / (1024f * 1024f)
    val foregroundMB: Float get() = foregroundBytes / (1024f * 1024f)
    val backgroundMB: Float get() = backgroundBytes / (1024f * 1024f)
}
