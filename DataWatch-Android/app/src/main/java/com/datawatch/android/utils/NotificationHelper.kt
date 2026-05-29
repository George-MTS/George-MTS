package com.datawatch.android.utils

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat
import com.datawatch.android.R

object NotificationHelper {

    private const val CHANNEL_ALERTS = "data_alerts"
    private const val NOTIFICATION_HIGH_USAGE = 1001
    private const val NOTIFICATION_DAILY_THRESHOLD = 1002

    fun createNotificationChannels(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            val channel = NotificationChannel(
                CHANNEL_ALERTS,
                "Data Usage Alerts",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Alerts when apps use excessive data"
            }
            manager.createNotificationChannel(channel)
        }
    }

    fun showHighUsageAlert(context: Context, appName: String, usageMB: Float) {
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val notification = NotificationCompat.Builder(context, CHANNEL_ALERTS)
            .setSmallIcon(R.drawable.ic_warning)
            .setContentTitle("High Data Usage Detected")
            .setContentText("$appName has used ${String.format("%.1f", usageMB)}MB today")
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .build()
        manager.notify(NOTIFICATION_HIGH_USAGE, notification)
    }

    fun showDailyThresholdAlert(context: Context, usageMB: Float) {
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val notification = NotificationCompat.Builder(context, CHANNEL_ALERTS)
            .setSmallIcon(R.drawable.ic_warning)
            .setContentTitle("Daily Data Limit Reached")
            .setContentText("You've used ${String.format("%.1f", usageMB)}MB of cellular data today")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()
        manager.notify(NOTIFICATION_DAILY_THRESHOLD, notification)
    }
}
