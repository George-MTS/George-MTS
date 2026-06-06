package com.datawatch.android.models

// FIX 2 + FIX 5: WiFi removed. Summary tracks cellular only.
// Percentage = (totalCellularBytes / dailyThresholdBytes) * 100, no rounding until display.
data class DataUsageSummary(
    val totalCellularBytes: Long,
    val dailyThresholdBytes: Long,
    val lastUpdated: Long = System.currentTimeMillis()
) {
    val totalMB: Float get() = totalCellularBytes / (1024f * 1024f)
    val thresholdMB: Float get() = dailyThresholdBytes / (1024f * 1024f)

    val usagePercentage: Float
        get() = if (dailyThresholdBytes > 0L) {
            (totalCellularBytes.toFloat() / dailyThresholdBytes.toFloat()).coerceIn(0f, 1f)
        } else 0f
}
