package com.datawatch.android.repository

import android.content.Context
import androidx.lifecycle.LiveData
import androidx.lifecycle.map
import com.datawatch.android.database.AppDatabase
import com.datawatch.android.database.AppUsageEntity
import com.datawatch.android.database.DailyUsageEntity
import com.datawatch.android.models.AppUsageModel
import com.datawatch.android.models.DataUsageSummary
import com.datawatch.android.services.NetworkStatsService
import com.datawatch.android.utils.PreferenceHelper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.*

class DataRepository(private val context: Context) {
    private val dao = AppDatabase.getDatabase(context).dataUsageDao()
    private val networkStatsService = NetworkStatsService(context)
    private val prefs = PreferenceHelper(context)

    private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
    private val today: String get() = dateFormat.format(Date())

    suspend fun refreshData() = withContext(Dispatchers.IO) {
        val appUsages = networkStatsService.getAppUsageForToday()
        val currentHour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)

        // BUG 1 FIX: composite PK (packageName, date) means REPLACE updates the single row
        // per app rather than inserting duplicates. Each refresh stores the latest cumulative
        // total from NetworkStatsManager — no summation, no double-counting.
        appUsages.forEach { usage ->
            dao.insertAppUsage(
                AppUsageEntity(
                    packageName = usage.packageName,
                    date = today,
                    cellularBytes = usage.cellularBytes,
                    wifiBytes = usage.wifiBytes,
                    foregroundBytes = usage.foregroundBytes,
                    backgroundBytes = usage.backgroundBytes,
                    lastUpdatedHour = currentHour
                )
            )
        }

        dao.insertDailyUsage(
            DailyUsageEntity(
                date = today,
                totalCellularBytes = networkStatsService.getTotalCellularUsageToday(),
                totalWifiBytes = networkStatsService.getTotalWifiUsageToday()
            )
        )
    }

    fun getLiveAppUsage(): LiveData<List<AppUsageModel>> {
        return dao.getAppUsageForDate(today).map { entities ->
            entities.mapNotNull { entity ->
                val pm = context.packageManager
                try {
                    val info = pm.getApplicationInfo(entity.packageName, 0)
                    AppUsageModel(
                        packageName = entity.packageName,
                        appName = pm.getApplicationLabel(info).toString(),
                        appIcon = pm.getApplicationIcon(entity.packageName),
                        totalBytes = entity.cellularBytes + entity.wifiBytes,
                        cellularBytes = entity.cellularBytes,
                        wifiBytes = entity.wifiBytes,
                        foregroundBytes = entity.foregroundBytes,
                        backgroundBytes = entity.backgroundBytes
                    )
                } catch (e: Exception) { null }
            }.sortedByDescending { it.totalBytes }
        }
    }

    // BUG 4 FIX: always query NetworkStatsManager directly for device totals.
    // The DB per-app sums are for listing purposes; the device-level summary uses the
    // authoritative system query which is always accurate regardless of DB state.
    suspend fun getCurrentSummary(): DataUsageSummary = withContext(Dispatchers.IO) {
        DataUsageSummary(
            totalCellularBytes = networkStatsService.getTotalCellularUsageToday(),
            totalWifiBytes = networkStatsService.getTotalWifiUsageToday(),
            dailyThresholdBytes = prefs.dailyThresholdMB * 1024L * 1024L
        )
    }

    fun getDailyUsageForApp(packageName: String): LiveData<List<AppUsageEntity>> {
        return dao.getDailyUsageForApp(packageName, today)
    }

    fun getWeeklyUsageForApp(packageName: String): LiveData<List<AppUsageEntity>> {
        val sevenDaysAgo = Calendar.getInstance().apply { add(Calendar.DAY_OF_YEAR, -7) }
        val startDate = dateFormat.format(sevenDaysAgo.time)
        return dao.getWeeklyUsageForApp(packageName, startDate)
    }

    suspend fun deleteAllData() = withContext(Dispatchers.IO) {
        dao.deleteAllAppUsage()
        dao.deleteAllDailyUsage()
    }
}
