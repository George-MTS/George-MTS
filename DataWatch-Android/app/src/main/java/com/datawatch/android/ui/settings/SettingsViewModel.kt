package com.datawatch.android.ui.settings

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.datawatch.android.repository.DataRepository
import com.datawatch.android.utils.PreferenceHelper
import kotlinx.coroutines.launch

class SettingsViewModel(application: Application) : AndroidViewModel(application) {
    private val prefs = PreferenceHelper(application)
    private val repository = DataRepository(application)

    private val _dailyThreshold = MutableLiveData(prefs.dailyThresholdMB)
    val dailyThreshold: LiveData<Long> = _dailyThreshold

    private val _notificationsEnabled = MutableLiveData(prefs.notificationsEnabled)
    val notificationsEnabled: LiveData<Boolean> = _notificationsEnabled

    // FIX 1: emitted after full reset completes so fragments can react immediately.
    private val _resetComplete = MutableLiveData<Boolean>()
    val resetComplete: LiveData<Boolean> = _resetComplete

    fun setDailyThreshold(mb: Long) {
        prefs.dailyThresholdMB = mb
        _dailyThreshold.value = mb
    }

    fun toggleNotifications(enabled: Boolean) {
        prefs.notificationsEnabled = enabled
        _notificationsEnabled.value = enabled
    }

    // FIX 1: full reset sequence:
    // 1. Wipe Room database (app_usage + daily_usage tables).
    // 2. Write resetTimestamp = now → future NSM queries start from this moment.
    // 3. Emit resetComplete so every fragment/ViewModel clears its in-memory cache.
    // The isRealDataMode flag is NOT cleared — once real data was seen, mock data stays blocked.
    fun resetAllData() {
        viewModelScope.launch {
            repository.deleteAllData()   // clears DB + sets prefs.resetTimestamp = now
            _resetComplete.postValue(true)
        }
    }
}
