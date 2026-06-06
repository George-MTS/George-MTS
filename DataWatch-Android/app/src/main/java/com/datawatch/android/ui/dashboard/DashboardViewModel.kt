package com.datawatch.android.ui.dashboard

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.datawatch.android.models.AppUsageModel
import com.datawatch.android.models.DataUsageSummary
import com.datawatch.android.repository.DataRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
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

    // FIX 2: WiFi filter removed. App tracks cellular only, no filter needed.
    // FIX 1: signal emitted after reset so DashboardFragment can clear in-memory list.
    private val _resetSignal = MutableLiveData<Boolean>()
    val resetSignal: LiveData<Boolean> = _resetSignal

    private var periodicJob: Job? = null

    init {
        refresh()
        startPeriodicRefresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                repository.refreshData()
                _summary.value = repository.getCurrentSummary()
                _lastUpdated.value = System.currentTimeMillis()
            } catch (e: Exception) {
                // Post summary from NSM even if DB write fails
                try { _summary.value = repository.getCurrentSummary() } catch (_: Exception) {}
            } finally {
                _isLoading.value = false
            }
        }
    }

    // FIX 5: timestamp updates every 30 seconds automatically.
    private fun startPeriodicRefresh() {
        periodicJob?.cancel()
        periodicJob = viewModelScope.launch {
            while (isActive) {
                delay(30_000L)
                try {
                    repository.refreshData()
                    _summary.value = repository.getCurrentSummary()
                    _lastUpdated.value = System.currentTimeMillis()
                } catch (_: Exception) {}
            }
        }
    }

    // FIX 1: called from SettingsViewModel via a shared reset event.
    // Clears the in-memory summary so the UI shows empty state immediately.
    fun onResetPerformed() {
        _summary.value = DataUsageSummary(
            totalCellularBytes = 0L,
            dailyThresholdBytes = _summary.value?.dailyThresholdBytes ?: 0L
        )
        _resetSignal.value = true
        // Immediately re-read from NSM (will return 0 since resetTimestamp just moved to now)
        refresh()
    }

    override fun onCleared() {
        super.onCleared()
        periodicJob?.cancel()
    }
}
