package com.datawatch.android.ui.apps

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.datawatch.android.database.AppUsageEntity
import com.datawatch.android.repository.DataRepository

// FIX 2: WiFi removed. Only cellular data referenced.
class AppDetailViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = DataRepository(application)

    private val _packageName = MutableLiveData<String>()

    // Today's single DB row for this app (composite PK = one row per day)
    lateinit var dailyUsage: LiveData<List<AppUsageEntity>>
    // One row per day for the past 7 days
    lateinit var weeklyUsage: LiveData<List<AppUsageEntity>>

    fun setPackageName(packageName: String) {
        _packageName.value = packageName
        dailyUsage = repository.getDailyUsageForApp(packageName)
        weeklyUsage = repository.getWeeklyUsageForApp(packageName)
    }
}
