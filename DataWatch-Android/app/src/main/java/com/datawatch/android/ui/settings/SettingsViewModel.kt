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

    fun setDailyThreshold(mb: Long) {
        prefs.dailyThresholdMB = mb
        _dailyThreshold.value = mb
    }

    fun toggleNotifications(enabled: Boolean) {
        prefs.notificationsEnabled = enabled
        _notificationsEnabled.value = enabled
    }

    fun resetAllData() {
        viewModelScope.launch {
            repository.deleteAllData()
        }
    }
}
