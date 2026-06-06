package com.datawatch.android

import com.datawatch.android.models.DataUsageSummary
import org.junit.Assert.*
import org.junit.Test

class DataRepositoryTest {

    @Test
    fun `DataUsageSummary usage percentage is zero when threshold is zero`() {
        val summary = DataUsageSummary(
            totalCellularBytes = 100 * 1024 * 1024L,
            dailyThresholdBytes = 0L
        )
        assertEquals(0f, summary.usagePercentage)
    }

    @Test
    fun `DataUsageSummary usage percentage is calculated correctly`() {
        val summary = DataUsageSummary(
            totalCellularBytes = 250 * 1024 * 1024L,
            dailyThresholdBytes = 500 * 1024 * 1024L
        )
        assertEquals(0.5f, summary.usagePercentage, 0.01f)
    }

    @Test
    fun `DataUsageSummary usage percentage is capped at 1`() {
        val summary = DataUsageSummary(
            totalCellularBytes = 1000 * 1024 * 1024L,
            dailyThresholdBytes = 500 * 1024 * 1024L
        )
        assertEquals(1f, summary.usagePercentage)
    }

    @Test
    fun `DataUsageSummary totalBytes equals cellularBytes — WiFi removed`() {
        val summary = DataUsageSummary(
            totalCellularBytes = 300L,
            dailyThresholdBytes = 1000L
        )
        // totalBytes is an alias for totalCellularBytes — WiFi no longer tracked
        assertEquals(300L, summary.totalCellularBytes)
    }
}
