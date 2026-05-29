package com.datawatch.android.database

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "daily_usage")
data class DailyUsageEntity(
    @PrimaryKey
    val date: String, // yyyy-MM-dd
    val totalCellularBytes: Long,
    val totalWifiBytes: Long,
    val timestamp: Long = System.currentTimeMillis()
)
