package com.datawatch.android.models

data class DataUsageSummary(
    val totalCellularBytes: Long,
    val totalWifiBytes: Long,
    val dailyThresholdBytes: Long,
    val lastUpdated: Long = System.currentTimeMillis()
) {
    val totalBytes: Long get() = totalCellularBytes + totalWifiBytes
    val totalMB: Float get() = totalBytes / (1024f * 1024f)
    val cellularMB: Float get() = totalCellularBytes / (1024f * 1024f)
    val wifiMB: Float get() = totalWifiBytes / (1024f * 1024f)
    val thresholdMB: Float get() = dailyThresholdBytes / (1024f * 1024f)
    val usagePercentage: Float
        get() = if (dailyThresholdBytes > 0) {
            (totalCellularBytes.toFloat() / dailyThresholdBytes.toFloat()).coerceIn(0f, 1f)
        } else 0f
}
