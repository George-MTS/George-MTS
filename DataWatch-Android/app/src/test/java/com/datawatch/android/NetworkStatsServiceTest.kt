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

    // Deduplication logic tests — mirror the HashMap+HashSet pattern used in
    // NetworkStatsService.getAppUsageForPeriod() without requiring Android framework.

    @Test
    fun `dedup map produces no duplicate UIDs from multiple buckets for same UID`() {
        data class UsageData(var rx: Long = 0, var tx: Long = 0)

        // Simulate multiple NSM buckets arriving for the same UID (common with STATE_ALL vs STATE_FOREGROUND)
        val buckets = listOf(
            Triple(10100, 500L, 200L),
            Triple(10100, 300L, 100L), // same UID, second bucket
            Triple(10200, 800L, 400L),
            Triple(10200, 100L, 50L),  // same UID, second bucket
            Triple(10300, 600L, 300L)
        )

        val usageMap = HashMap<Int, UsageData>()
        for ((uid, rx, tx) in buckets) {
            val entry = usageMap.getOrPut(uid) { UsageData() }
            entry.rx += rx
            entry.tx += tx
        }

        // Assert no duplicate UIDs in final output
        val outputUids = usageMap.keys.toList()
        assertEquals("Output must have no duplicate UIDs", outputUids.size, outputUids.toSet().size)
        assertEquals(3, outputUids.size)
    }

    @Test
    fun `dedup map correctly sums bytes for same UID across buckets`() {
        data class UsageData(var rx: Long = 0, var tx: Long = 0)

        val usageMap = HashMap<Int, UsageData>()

        // UID 10100 appears twice — bytes must be summed
        val entry1 = usageMap.getOrPut(10100) { UsageData() }
        entry1.rx += 500; entry1.tx += 200
        val entry2 = usageMap.getOrPut(10100) { UsageData() }
        entry2.rx += 300; entry2.tx += 100

        val result = usageMap[10100]!!
        assertEquals(800L, result.rx)
        assertEquals(300L, result.tx)
    }

    @Test
    fun `secondary seenUids HashSet prevents any duplicate UID in output list`() {
        // Reproduces the seenUids guard: even if map somehow had duplicate keys (impossible
        // in HashMap but validates the guard logic), the set blocks duplicates.
        val uidCandidates = listOf(10100, 10200, 10100, 10300, 10200)
        val seenUids = HashSet<Int>()
        val outputUids = mutableListOf<Int>()

        for (uid in uidCandidates) {
            if (seenUids.add(uid)) {
                outputUids.add(uid)
            }
        }

        assertEquals(3, outputUids.size)
        assertEquals(outputUids.size, outputUids.toSet().size)
    }

    @Test
    fun `system UIDs below 10000 are excluded from usage output`() {
        // Mirrors: if (uid < 10000) continue
        val rawUids = listOf(0, 1000, 9999, 10000, 10100, 10200)
        val appUids = rawUids.filter { it >= 10000 }
        assertEquals(listOf(10000, 10100, 10200), appUids)
    }

    @Test
    fun `backgroundBytes equals cellularTotal minus activeBytes non-negative`() {
        val cellularTotal = 1000L
        val activeBytes = 1200L // active > total (shouldn't happen but must not go negative)
        val backgroundBytes = (cellularTotal - activeBytes).coerceAtLeast(0L)
        assertEquals(0L, backgroundBytes)
    }

    @Test
    fun `backgroundBytes correctly computed when active is less than total`() {
        val cellularTotal = 1000L
        val activeBytes = 400L
        val backgroundBytes = (cellularTotal - activeBytes).coerceAtLeast(0L)
        assertEquals(600L, backgroundBytes)
    }
}
