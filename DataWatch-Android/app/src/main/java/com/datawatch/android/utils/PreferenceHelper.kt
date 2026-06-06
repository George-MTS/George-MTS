package com.datawatch.android.utils

import android.content.Context
import android.content.SharedPreferences

class PreferenceHelper(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("datawatch_prefs", Context.MODE_PRIVATE)

    var dailyThresholdMB: Long
        get() = prefs.getLong("daily_threshold_mb", 500L)
        set(value) = prefs.edit().putLong("daily_threshold_mb", value).apply()

    var notificationsEnabled: Boolean
        get() = prefs.getBoolean("notifications_enabled", true)
        set(value) = prefs.edit().putBoolean("notifications_enabled", value).apply()

    var isFirstLaunch: Boolean
        get() = prefs.getBoolean("is_first_launch", true)
        set(value) = prefs.edit().putBoolean("is_first_launch", value).apply()

    // Set permanently to true the first time real (non-zero) cellular data is received.
    // Once true, no mock data can ever load regardless of app state.
    var isRealDataMode: Boolean
        get() = prefs.getBoolean("is_real_data_mode", false)
        set(value) = prefs.edit().putBoolean("is_real_data_mode", value).apply()

    // Epoch ms of last Reset All Data press. NetworkStatsManager queries use
    // max(midnightMs, resetTimestamp) as the start time, so data before the reset
    // is invisible even though the OS still holds it historically.
    var resetTimestamp: Long
        get() = prefs.getLong("reset_timestamp", 0L)
        set(value) = prefs.edit().putLong("reset_timestamp", value).apply()

    // Called on Reset All Data. Sets resetTimestamp to now so future queries start
    // from this moment. User settings (threshold, notifications) are preserved.
    fun performReset() {
        prefs.edit()
            .putLong("reset_timestamp", System.currentTimeMillis())
            .apply()
    }
}
