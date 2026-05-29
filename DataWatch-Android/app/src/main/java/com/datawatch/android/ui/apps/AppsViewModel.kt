package com.datawatch.android.ui.apps

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import com.datawatch.android.models.AppUsageModel
import com.datawatch.android.repository.DataRepository

class AppsViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = DataRepository(application)
    val appUsageList: LiveData<List<AppUsageModel>> = repository.getLiveAppUsage()
}
