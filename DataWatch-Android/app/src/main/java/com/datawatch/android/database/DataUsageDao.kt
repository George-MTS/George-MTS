package com.datawatch.android.database

import androidx.lifecycle.LiveData
import androidx.room.*

@Dao
interface DataUsageDao {

    // FIX 3: composite PK (packageName, date) + REPLACE = one row per app per day, always updated.
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAppUsage(entity: AppUsageEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDailyUsage(entity: DailyUsageEntity)

    // Returns one row per app (guaranteed by composite PK), ordered by total cellular bytes desc.
    // Apps with zero cellular bytes are excluded by the WHERE clause.
    @Query("""
        SELECT * FROM app_usage
        WHERE date = :date AND cellularBytes > 0
        ORDER BY cellularBytes DESC
    """)
    fun getAppUsageForDate(date: String): LiveData<List<AppUsageEntity>>

    // Returns the single daily row for this app (at most one row per day due to composite PK).
    @Query("SELECT * FROM app_usage WHERE packageName = :packageName AND date = :date LIMIT 1")
    fun getDailyUsageForApp(packageName: String, date: String): LiveData<List<AppUsageEntity>>

    // Returns one row per day for this app over the past N days, ordered by date ascending.
    @Query("""
        SELECT * FROM app_usage
        WHERE packageName = :packageName AND date >= :startDate
        ORDER BY date ASC
    """)
    fun getWeeklyUsageForApp(packageName: String, startDate: String): LiveData<List<AppUsageEntity>>

    @Query("SELECT SUM(cellularBytes) as cellular FROM app_usage WHERE date = :date")
    suspend fun getTotalCellularForDate(date: String): Long?

    @Query("SELECT * FROM daily_usage ORDER BY date DESC LIMIT 7")
    fun getWeeklyDailyUsage(): LiveData<List<DailyUsageEntity>>

    // FIX 1: full reset clears all usage history.
    @Query("DELETE FROM app_usage")
    suspend fun deleteAllAppUsage()

    @Query("DELETE FROM daily_usage")
    suspend fun deleteAllDailyUsage()
}
