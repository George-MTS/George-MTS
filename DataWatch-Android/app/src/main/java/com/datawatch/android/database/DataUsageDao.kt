package com.datawatch.android.database

import androidx.lifecycle.LiveData
import androidx.room.*

@Dao
interface DataUsageDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAppUsage(entity: AppUsageEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDailyUsage(entity: DailyUsageEntity)

    @Query("SELECT * FROM app_usage WHERE date = :date ORDER BY (cellularBytes + wifiBytes) DESC")
    fun getAppUsageForDate(date: String): LiveData<List<AppUsageEntity>>

    @Query("SELECT * FROM app_usage WHERE date = :date ORDER BY (cellularBytes + wifiBytes) DESC")
    suspend fun getAppUsageForDateSync(date: String): List<AppUsageEntity>

    @Query("SELECT * FROM app_usage WHERE packageName = :packageName AND date = :date ORDER BY hour ASC")
    fun getHourlyUsageForApp(packageName: String, date: String): LiveData<List<AppUsageEntity>>

    @Query("SELECT * FROM app_usage WHERE packageName = :packageName AND date >= :startDate ORDER BY date ASC, hour ASC")
    fun getWeeklyUsageForApp(packageName: String, startDate: String): LiveData<List<AppUsageEntity>>

    @Query("SELECT SUM(cellularBytes) as cellular, SUM(wifiBytes) as wifi FROM app_usage WHERE date = :date")
    suspend fun getTotalUsageForDate(date: String): UsageTotals?

    @Query("SELECT * FROM daily_usage ORDER BY date DESC LIMIT 7")
    fun getWeeklyDailyUsage(): LiveData<List<DailyUsageEntity>>

    @Query("DELETE FROM app_usage")
    suspend fun deleteAllAppUsage()

    @Query("DELETE FROM daily_usage")
    suspend fun deleteAllDailyUsage()

    @Query("SELECT DISTINCT packageName FROM app_usage WHERE date = :date")
    suspend fun getActivePackagesForDate(date: String): List<String>
}

data class UsageTotals(
    val cellular: Long?,
    val wifi: Long?
)
