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
        val resetTs = prefs.resetTimestamp
        val appUsages = networkStatsService.getAppUsageForToday(resetTs)
        val currentHour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)

        // FIX 1: once real cellular data arrives, lock isRealDataMode permanently.
        // From this point forward no mock data can ever be displayed.
        if (appUsages.isNotEmpty() && !prefs.isRealDataMode) {
            prefs.isRealDataMode = true
        }

        // FIX 3: composite PK (packageName, date) + REPLACE = exactly one row per app per day.
        // NetworkStatsManager already deduped by UID in NetworkStatsService.
        appUsages.forEach { usage ->
            dao.insertAppUsage(
                AppUsageEntity(
                    packageName = usage.packageName,
                    date = today,
                    cellularBytes = usage.cellularBytes,
                    activeBytes = usage.activeBytes,
                    backgroundBytes = usage.backgroundBytes,
                    lastUpdatedHour = currentHour
                )
            )
        }

        dao.insertDailyUsage(
            DailyUsageEntity(
                date = today,
                totalCellularBytes = networkStatsService.getTotalCellularUsageToday(resetTs)
            )
        )
    }

    fun getLiveAppUsage(): LiveData<List<AppUsageModel>> {
        return dao.getAppUsageForDate(today).map { entities ->
            entities.mapNotNull { entity ->
                if (entity.cellularBytes == 0L) return@mapNotNull null
                val pm = context.packageManager
                try {
                    val info = pm.getApplicationInfo(entity.packageName, 0)
                    AppUsageModel(
                        packageName = entity.packageName,
                        appName = pm.getApplicationLabel(info).toString(),
                        appIcon = pm.getApplicationIcon(entity.packageName),
                        cellularBytes = entity.cellularBytes,
                        activeBytes = entity.activeBytes,
                        backgroundBytes = entity.backgroundBytes
                    )
                } catch (e: Exception) { null }
            }.sortedByDescending { it.cellularBytes }
        }
    }

    // FIX 5: always query NetworkStatsManager directly for the device-level total.
    // Uses resetTimestamp so data before a Reset All Data press is excluded.
    suspend fun getCurrentSummary(): DataUsageSummary = withContext(Dispatchers.IO) {
        val resetTs = prefs.resetTimestamp
        DataUsageSummary(
            totalCellularBytes = networkStatsService.getTotalCellularUsageToday(resetTs),
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

    // FIX 1: full reset.
    // 1. Clear all DB usage history.
    // 2. Set resetTimestamp to now — future NSM queries start from this moment, so
    //    historical data before the reset never reappears even after a VM refresh.
    // 3. WorkManager workers use the same resetTimestamp, so background jobs also
    //    respect the reset boundary.
    suspend fun deleteAllData() = withContext(Dispatchers.IO) {
        dao.deleteAllAppUsage()
        dao.deleteAllDailyUsage()
        prefs.performReset()
    }

    fun hasCellularConnectivity(): Boolean = networkStatsService.hasCellularConnectivity()
}
