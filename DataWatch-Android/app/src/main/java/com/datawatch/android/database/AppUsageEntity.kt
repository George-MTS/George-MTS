package com.datawatch.android.database

import androidx.room.Entity

// BUG 1 FIX: composite primary key (packageName, date) ensures exactly one row per app per day.
// NetworkStatsManager returns cumulative totals since midnight, so each refresh uses REPLACE to
// update the single row rather than accumulating duplicate rows across multiple refreshes.
@Entity(
    tableName = "app_usage",
    primaryKeys = ["packageName", "date"]
)
data class AppUsageEntity(
    val packageName: String,
    val date: String,               // yyyy-MM-dd
    val cellularBytes: Long,
    val wifiBytes: Long,
    val foregroundBytes: Long,
    val backgroundBytes: Long,
    val lastUpdatedHour: Int = 0,   // informational; not used for dedup
    val timestamp: Long = System.currentTimeMillis()
)
