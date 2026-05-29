package com.datawatch.android

import android.app.Application
import androidx.work.*
import com.datawatch.android.services.DataMonitorWorker
import com.datawatch.android.utils.NotificationHelper
import java.util.concurrent.TimeUnit

class DataWatchApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        NotificationHelper.createNotificationChannels(this)
        scheduleBackgroundMonitoring()
    }

    private fun scheduleBackgroundMonitoring() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val workRequest = PeriodicWorkRequestBuilder<DataMonitorWorker>(15, TimeUnit.MINUTES)
            .setConstraints(constraints)
            .setBackoffCriteria(BackoffPolicy.LINEAR, 5, TimeUnit.MINUTES)
            .build()

        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            "data_monitor",
            ExistingPeriodicWorkPolicy.KEEP,
            workRequest
        )
    }
}
