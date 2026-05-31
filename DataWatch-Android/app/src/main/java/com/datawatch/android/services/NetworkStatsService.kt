package com.datawatch.android.services

import android.app.usage.NetworkStats
import android.app.usage.NetworkStatsManager
import android.content.Context
import android.content.pm.PackageManager
import android.net.ConnectivityManager
import android.telephony.TelephonyManager
import android.util.Log
import com.datawatch.android.models.AppUsageModel
import java.util.Calendar

class NetworkStatsService(private val context: Context) {

    private val networkStatsManager: NetworkStatsManager by lazy {
        context.getSystemService(Context.NETWORK_STATS_SERVICE) as NetworkStatsManager
    }

    private val packageManager: PackageManager = context.packageManager

    fun getAppUsageForToday(): List<AppUsageModel> {
        val calendar = Calendar.getInstance()
        calendar.set(Calendar.HOUR_OF_DAY, 0)
        calendar.set(Calendar.MINUTE, 0)
        calendar.set(Calendar.SECOND, 0)
        calendar.set(Calendar.MILLISECOND, 0)
        val startTime = calendar.timeInMillis
        val endTime = System.currentTimeMillis()
        return getAppUsageForPeriod(startTime, endTime)
    }

    fun getAppUsageForPeriod(startTime: Long, endTime: Long): List<AppUsageModel> {
        val usageMap = mutableMapOf<Int, AppUsageData>()

        try {
            val cellularStats = networkStatsManager.querySummary(
                ConnectivityManager.TYPE_MOBILE,
                getSubscriberId(),
                startTime,
                endTime
            )
            processBucket(cellularStats, usageMap, isCellular = true)
            cellularStats.close()
        } catch (e: SecurityException) {
            Log.w("NetworkStatsService", "Permission denied for cellular stats: ${e.message}")
        } catch (e: Exception) {
            Log.w("NetworkStatsService", "Could not get cellular stats: ${e.message}")
        }

        try {
            val wifiStats = networkStatsManager.querySummary(
                ConnectivityManager.TYPE_WIFI,
                null,
                startTime,
                endTime
            )
            processBucket(wifiStats, usageMap, isCellular = false)
            wifiStats.close()
        } catch (e: SecurityException) {
            Log.w("NetworkStatsService", "Permission denied for WiFi stats: ${e.message}")
        } catch (e: Exception) {
            Log.w("NetworkStatsService", "Could not get WiFi stats: ${e.message}")
        }

        return usageMap.mapNotNull { (uid, data) ->
            val packages = try {
                packageManager.getPackagesForUid(uid)
            } catch (e: Exception) {
                null
            }
            val packageName = packages?.firstOrNull() ?: return@mapNotNull null
            val appInfo = try {
                packageManager.getApplicationInfo(packageName, 0)
            } catch (e: Exception) {
                return@mapNotNull null
            }
            val appName = packageManager.getApplicationLabel(appInfo).toString()
            val appIcon = try {
                packageManager.getApplicationIcon(packageName)
            } catch (e: Exception) {
                null
            }
            AppUsageModel(
                packageName = packageName,
                appName = appName,
                appIcon = appIcon,
                totalBytes = data.cellularRx + data.cellularTx + data.wifiRx + data.wifiTx,
                cellularBytes = data.cellularRx + data.cellularTx,
                wifiBytes = data.wifiRx + data.wifiTx,
                foregroundBytes = data.foregroundRx + data.foregroundTx,
                backgroundBytes = (data.cellularRx + data.cellularTx + data.wifiRx + data.wifiTx) - (data.foregroundRx + data.foregroundTx)
            )
        }.filter { it.totalBytes > 0 }
         .sortedByDescending { it.totalBytes }
    }

    fun getTotalCellularUsageToday(): Long {
        val calendar = Calendar.getInstance()
        calendar.set(Calendar.HOUR_OF_DAY, 0)
        calendar.set(Calendar.MINUTE, 0)
        calendar.set(Calendar.SECOND, 0)
        calendar.set(Calendar.MILLISECOND, 0)
        return try {
            val stats = networkStatsManager.querySummaryForDevice(
                ConnectivityManager.TYPE_MOBILE,
                getSubscriberId(),
                calendar.timeInMillis,
                System.currentTimeMillis()
            )
            stats.rxBytes + stats.txBytes
        } catch (e: SecurityException) {
            Log.w("NetworkStatsService", "Permission denied for total cellular: ${e.message}")
            0L
        } catch (e: Exception) {
            Log.w("NetworkStatsService", "Could not get total cellular: ${e.message}")
            0L
        }
    }

    fun getTotalWifiUsageToday(): Long {
        val calendar = Calendar.getInstance()
        calendar.set(Calendar.HOUR_OF_DAY, 0)
        calendar.set(Calendar.MINUTE, 0)
        calendar.set(Calendar.SECOND, 0)
        calendar.set(Calendar.MILLISECOND, 0)
        return try {
            val stats = networkStatsManager.querySummaryForDevice(
                ConnectivityManager.TYPE_WIFI,
                null,
                calendar.timeInMillis,
                System.currentTimeMillis()
            )
            stats.rxBytes + stats.txBytes
        } catch (e: SecurityException) {
            Log.w("NetworkStatsService", "Permission denied for total WiFi: ${e.message}")
            0L
        } catch (e: Exception) {
            Log.w("NetworkStatsService", "Could not get total WiFi: ${e.message}")
            0L
        }
    }

    private fun processBucket(stats: NetworkStats, map: MutableMap<Int, AppUsageData>, isCellular: Boolean) {
        val bucket = NetworkStats.Bucket()
        while (stats.hasNextBucket()) {
            stats.getNextBucket(bucket)
            val uid = bucket.uid
            if (uid < 10000) continue
            val data = map.getOrPut(uid) { AppUsageData() }
            if (isCellular) {
                data.cellularRx += bucket.rxBytes
                data.cellularTx += bucket.txBytes
            } else {
                data.wifiRx += bucket.rxBytes
                data.wifiTx += bucket.txBytes
            }
            if (bucket.state == NetworkStats.Bucket.STATE_FOREGROUND) {
                data.foregroundRx += bucket.rxBytes
                data.foregroundTx += bucket.txBytes
            }
        }
    }

    private fun getSubscriberId(): String? {
        return try {
            val tm = context.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
            tm.subscriberId
        } catch (e: Exception) {
            null
        }
    }

    private data class AppUsageData(
        var cellularRx: Long = 0,
        var cellularTx: Long = 0,
        var wifiRx: Long = 0,
        var wifiTx: Long = 0,
        var foregroundRx: Long = 0,
        var foregroundTx: Long = 0
    )
}
