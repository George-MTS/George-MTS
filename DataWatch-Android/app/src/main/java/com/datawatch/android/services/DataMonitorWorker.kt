package com.datawatch.android.services

import android.content.Context
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.datawatch.android.database.AppDatabase
import com.datawatch.android.database.AppUsageEntity
import com.datawatch.android.database.DailyUsageEntity
import com.datawatch.android.utils.NotificationHelper
import com.datawatch.android.utils.PreferenceHelper
import java.text.SimpleDateFormat
import java.util.*

// FIX 2: WiFi tracking removed. Only cellular data is monitored.
// FIX 1: resetTimestamp is respected — queries start from max(midnight, resetTimestamp).
class DataMonitorWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        return try {
            val networkStatsService = NetworkStatsService(applicationContext)
            val dao = AppDatabase.getDatabase(applicationContext).dataUsageDao()
            val prefs = PreferenceHelper(applicationContext)

            val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
            val currentHour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
            val resetTs = prefs.resetTimestamp

            val appUsages = networkStatsService.getAppUsageForToday(resetTs)

            if (appUsages.isNotEmpty() && !prefs.isRealDataMode) {
                prefs.isRealDataMode = true
            }

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
                // Alert if any single app exceeds 50MB cellular in one session
                if (usage.totalMB > 50f && prefs.notificationsEnabled) {
                    NotificationHelper.showHighUsageAlert(
                        applicationContext, usage.appName, usage.totalMB
                    )
                }
            }

            val totalCellular = networkStatsService.getTotalCellularUsageToday(resetTs)
            dao.insertDailyUsage(
                DailyUsageEntity(date = today, totalCellularBytes = totalCellular)
            )

            val thresholdBytes = prefs.dailyThresholdMB * 1024L * 1024L
            if (thresholdBytes > 0 && totalCellular > thresholdBytes && prefs.notificationsEnabled) {
                NotificationHelper.showDailyThresholdAlert(
                    applicationContext, totalCellular / (1024f * 1024f)
                )
            }

            Result.success()
        } catch (e: Exception) {
            Log.e("DataMonitorWorker", "Work failed", e)
            Result.retry()
        }
    }
}
