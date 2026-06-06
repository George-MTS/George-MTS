package com.datawatch.android.database

import androidx.room.Entity
import androidx.room.PrimaryKey

// FIX 2: WiFi column removed. Daily summary tracks cellular data only.
@Entity(tableName = "daily_usage")
data class DailyUsageEntity(
    @PrimaryKey
    val date: String,               // yyyy-MM-dd
    val totalCellularBytes: Long,
    val timestamp: Long = System.currentTimeMillis()
)
