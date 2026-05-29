package com.datawatch.android.database

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "app_usage")
data class AppUsageEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val packageName: String,
    val date: String, // yyyy-MM-dd
    val hour: Int,
    val cellularBytes: Long,
    val wifiBytes: Long,
    val foregroundBytes: Long,
    val backgroundBytes: Long,
    val timestamp: Long = System.currentTimeMillis()
)
