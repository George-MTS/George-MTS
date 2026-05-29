package com.datawatch.android

import com.datawatch.android.utils.FormatUtils
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.mockito.MockitoAnnotations

class NetworkStatsServiceTest {

    @Before
    fun setUp() {
        MockitoAnnotations.openMocks(this)
    }

    @Test
    fun `formatBytes returns correct byte format`() {
        assertEquals("512 B", FormatUtils.formatBytes(512))
    }

    @Test
    fun `formatBytes returns correct KB format`() {
        val result = FormatUtils.formatBytes(1536)
        assertTrue(result.contains("KB"))
    }

    @Test
    fun `formatBytes returns correct MB format`() {
        val result = FormatUtils.formatBytes(1572864)
        assertTrue(result.contains("MB"))
    }

    @Test
    fun `formatBytes returns correct GB format`() {
        val result = FormatUtils.formatBytes(1610612736)
        assertTrue(result.contains("GB"))
    }

    @Test
    fun `formatMB under 1024 shows MB`() {
        val result = FormatUtils.formatMB(500f)
        assertTrue(result.contains("MB"))
    }

    @Test
    fun `formatMB over 1024 shows GB`() {
        val result = FormatUtils.formatMB(2048f)
        assertTrue(result.contains("GB"))
    }
}
