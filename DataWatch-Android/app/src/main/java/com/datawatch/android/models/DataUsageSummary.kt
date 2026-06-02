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

    // BUG 4 FIX: percentage tracks cellular usage against the threshold (the Safaricom bundle
    // use case). Previously only used cellular in numerator which was correct, but the
    // underlying data was 0 because getCurrentSummary() fell back to a stale DB sum.
    // Now the repository always calls NetworkStatsManager directly for real device totals.
    val usagePercentage: Float
        get() = if (dailyThresholdBytes > 0) {
            (totalCellularBytes.toFloat() / dailyThresholdBytes.toFloat()).coerceIn(0f, 1f)
        } else 0f
}
