package com.datawatch.android.services

import android.app.usage.NetworkStats
import android.app.usage.NetworkStatsManager
import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Build
import android.telephony.TelephonyManager
import android.util.Log
import com.datawatch.android.models.AppUsageModel
import java.util.Calendar

// FIX 2 + FIX 3 + FIX 4:
// - WiFi tracking removed completely. Only TYPE_MOBILE is queried.
// - HashMap<UID, AppUsageData> deduplication: same UID across multiple buckets gets bytes
//   accumulated (summed) into a single entry — never a new row.
// - Secondary seenUids HashSet guards against any edge-case duplicate UID in the output list.
// - Foreground (active) bytes are tracked separately for cellular only.
// - startFromTimestamp: queries start from max(midnight, resetTimestamp) so data before a
//   Reset All Data press is invisible even though the OS still holds it historically.
class NetworkStatsService(private val context: Context) {

    private val networkStatsManager: NetworkStatsManager by lazy {
        context.getSystemService(Context.NETWORK_STATS_SERVICE) as NetworkStatsManager
    }

    private val packageManager = context.packageManager

    fun getAppUsageForToday(startFromTimestamp: Long = 0L): List<AppUsageModel> {
        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        val midnightMs = calendar.timeInMillis
        val startTime = if (startFromTimestamp > midnightMs) startFromTimestamp else midnightMs
        return getAppUsageForPeriod(startTime, System.currentTimeMillis())
    }

    fun getAppUsageForPeriod(startTime: Long, endTime: Long): List<AppUsageModel> {
        // FIX 3: HashMap keyed by UID accumulates bytes — same UID from multiple buckets sums.
        val usageMap = HashMap<Int, AppUsageData>()

        try {
            val cellularStats = networkStatsManager.querySummary(
                ConnectivityManager.TYPE_MOBILE,
                getSubscriberId(),
                startTime,
                endTime
            )
            val bucket = NetworkStats.Bucket()
            while (cellularStats.hasNextBucket()) {
                cellularStats.getNextBucket(bucket)
                val uid = bucket.uid
                if (uid < 10000) continue  // skip kernel/system UIDs

                // Accumulate — do NOT create a new entry if UID already seen
                val data = usageMap.getOrPut(uid) { AppUsageData() }
                data.cellularRx += bucket.rxBytes
                data.cellularTx += bucket.txBytes

                // FIX 4: track foreground cellular separately for Active vs Background split
                if (bucket.state == NetworkStats.Bucket.STATE_FOREGROUND) {
                    data.activeCellularRx += bucket.rxBytes
                    data.activeCellularTx += bucket.txBytes
                }
            }
            cellularStats.close()
        } catch (e: SecurityException) {
            Log.w("NetworkStatsService", "Permission denied for cellular stats: ${e.message}")
        } catch (e: Exception) {
            Log.w("NetworkStatsService", "Could not get cellular stats: ${e.message}")
        }

        // FIX 3: secondary guard — seenUids ensures the output list never has duplicate entries
        val seenUids = HashSet<Int>()

        return usageMap.mapNotNull { (uid, data) ->
            // Secondary dedup guard
            if (!seenUids.add(uid)) return@mapNotNull null

            val cellularTotal = data.cellularRx + data.cellularTx
            // FIX 6: hide apps with zero cellular bytes
            if (cellularTotal == 0L) return@mapNotNull null

            val packages = try { packageManager.getPackagesForUid(uid) } catch (e: Exception) { null }
            val packageName = packages?.firstOrNull() ?: return@mapNotNull null

            val appInfo = try {
                packageManager.getApplicationInfo(packageName, 0)
            } catch (e: Exception) {
                return@mapNotNull null
            }

            val appName = packageManager.getApplicationLabel(appInfo).toString()
            val appIcon = try { packageManager.getApplicationIcon(packageName) } catch (e: Exception) { null }

            // FIX 4: active = foreground cellular; background = rest
            val activeBytes = (data.activeCellularRx + data.activeCellularTx).coerceAtLeast(0L)
            val backgroundBytes = (cellularTotal - activeBytes).coerceAtLeast(0L)

            AppUsageModel(
                packageName = packageName,
                appName = appName,
                appIcon = appIcon,
                cellularBytes = cellularTotal,
                activeBytes = activeBytes,
                backgroundBytes = backgroundBytes
            )
        }.sortedByDescending { it.cellularBytes }
    }

    fun getTotalCellularUsageToday(startFromTimestamp: Long = 0L): Long {
        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        val midnightMs = calendar.timeInMillis
        val startTime = if (startFromTimestamp > midnightMs) startFromTimestamp else midnightMs

        return try {
            val stats = networkStatsManager.querySummaryForDevice(
                ConnectivityManager.TYPE_MOBILE,
                getSubscriberId(),
                startTime,
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

    // FIX 2: checks whether device currently has an active cellular/mobile connection.
    // Returns false if WiFi-only or no connection — dashboard shows a prompt.
    fun hasCellularConnectivity(): Boolean {
        val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val network = cm.activeNetwork ?: return false
                val caps = cm.getNetworkCapabilities(network) ?: return false
                caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR)
            } else {
                @Suppress("DEPRECATION")
                val info = cm.activeNetworkInfo
                @Suppress("DEPRECATION")
                info != null && info.type == ConnectivityManager.TYPE_MOBILE && info.isConnected
            }
        } catch (e: Exception) {
            false
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
        var activeCellularRx: Long = 0,  // FIX 4: foreground cellular only
        var activeCellularTx: Long = 0
    )
}
