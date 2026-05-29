package com.datawatch.android.ui.apps

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.datawatch.android.database.AppUsageEntity
import com.datawatch.android.repository.DataRepository

class AppDetailViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = DataRepository(application)

    private val _packageName = MutableLiveData<String>()

    lateinit var hourlyUsage: LiveData<List<AppUsageEntity>>
    lateinit var weeklyUsage: LiveData<List<AppUsageEntity>>

    fun setPackageName(packageName: String) {
        _packageName.value = packageName
        hourlyUsage = repository.getHourlyUsageForApp(packageName)
        weeklyUsage = repository.getWeeklyUsageForApp(packageName)
    }
}
