package com.datawatch.android.ui.dashboard

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.datawatch.android.models.AppUsageModel
import com.datawatch.android.models.DataUsageSummary
import com.datawatch.android.repository.DataRepository
import kotlinx.coroutines.launch

class DashboardViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = DataRepository(application)

    val appUsageList: LiveData<List<AppUsageModel>> = repository.getLiveAppUsage()

    private val _summary = MutableLiveData<DataUsageSummary>()
    val summary: LiveData<DataUsageSummary> = _summary

    private val _isLoading = MutableLiveData(false)
    val isLoading: LiveData<Boolean> = _isLoading

    private val _lastUpdated = MutableLiveData<Long>()
    val lastUpdated: LiveData<Long> = _lastUpdated

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                repository.refreshData()
                _summary.value = repository.getCurrentSummary()
                _lastUpdated.value = System.currentTimeMillis()
            } catch (e: Exception) {
                // Use cached data
            } finally {
                _isLoading.value = false
            }
        }
    }
}
