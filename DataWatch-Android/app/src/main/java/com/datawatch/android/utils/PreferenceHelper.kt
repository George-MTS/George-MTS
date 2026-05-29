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
}
