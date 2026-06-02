package com.datawatch.android.database

import androidx.lifecycle.LiveData
import androidx.room.*

@Dao
interface DataUsageDao {

    // BUG 1 FIX: schema now uses composite PK (packageName, date), so REPLACE updates
    // the existing row for an app rather than inserting a new duplicate each refresh.
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAppUsage(entity: AppUsageEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDailyUsage(entity: DailyUsageEntity)

    // Returns one row per app (guaranteed by composite PK), ordered by total bytes descending.
    @Query("SELECT * FROM app_usage WHERE date = :date ORDER BY (cellularBytes + wifiBytes) DESC")
    fun getAppUsageForDate(date: String): LiveData<List<AppUsageEntity>>

    @Query("SELECT * FROM app_usage WHERE date = :date ORDER BY (cellularBytes + wifiBytes) DESC")
    suspend fun getAppUsageForDateSync(date: String): List<AppUsageEntity>

    // Returns the single daily row for this app (composite PK means at most one row per day).
    @Query("SELECT * FROM app_usage WHERE packageName = :packageName AND date = :date LIMIT 1")
    fun getDailyUsageForApp(packageName: String, date: String): LiveData<List<AppUsageEntity>>

    // Returns one row per day for this app over the past 7 days.
    @Query("SELECT * FROM app_usage WHERE packageName = :packageName AND date >= :startDate ORDER BY date ASC")
    fun getWeeklyUsageForApp(packageName: String, startDate: String): LiveData<List<AppUsageEntity>>

    @Query("SELECT SUM(cellularBytes) as cellular, SUM(wifiBytes) as wifi FROM app_usage WHERE date = :date")
    suspend fun getTotalUsageForDate(date: String): UsageTotals?

    @Query("SELECT * FROM daily_usage ORDER BY date DESC LIMIT 7")
    fun getWeeklyDailyUsage(): LiveData<List<DailyUsageEntity>>

    @Query("DELETE FROM app_usage")
    suspend fun deleteAllAppUsage()

    @Query("DELETE FROM daily_usage")
    suspend fun deleteAllDailyUsage()
}

data class UsageTotals(
    val cellular: Long?,
    val wifi: Long?
)
