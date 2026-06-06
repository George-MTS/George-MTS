package com.datawatch.android.database

import androidx.room.Entity

// FIX 2 + FIX 3:
// - WiFi columns removed entirely. This table tracks Safaricom cellular data only.
// - Composite primary key (packageName, date) ensures exactly one row per app per day.
//   NetworkStatsManager returns cumulative totals since midnight (or resetTimestamp),
//   so REPLACE updates the single row on each refresh — no duplicates ever accumulate.
@Entity(
    tableName = "app_usage",
    primaryKeys = ["packageName", "date"]
)
data class AppUsageEntity(
    val packageName: String,
    val date: String,               // yyyy-MM-dd
    val cellularBytes: Long,        // total cellular (rx + tx)
    val activeBytes: Long,          // cellular while app in foreground
    val backgroundBytes: Long,      // cellular while app in background
    val lastUpdatedHour: Int = 0,
    val timestamp: Long = System.currentTimeMillis()
)
