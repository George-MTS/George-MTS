package com.datawatch.android.ui.apps

import android.content.pm.PackageManager
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.navArgs
import com.github.mikephil.charting.data.BarData
import com.github.mikephil.charting.data.BarDataSet
import com.github.mikephil.charting.data.BarEntry
import com.datawatch.android.databinding.FragmentAppDetailBinding
import com.datawatch.android.utils.FormatUtils

// FIX 2: WiFi references removed entirely. Shows cellular Active vs Background breakdown.
class AppDetailFragment : Fragment() {
    private var _binding: FragmentAppDetailBinding? = null
    private val binding get() = _binding!!
    private val viewModel: AppDetailViewModel by viewModels()
    private val args: AppDetailFragmentArgs by navArgs()

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentAppDetailBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val packageName = args.packageName
        viewModel.setPackageName(packageName)

        try {
            val pm = requireContext().packageManager
            val info = pm.getApplicationInfo(packageName, 0)
            binding.tvAppName.text = pm.getApplicationLabel(info).toString()
            binding.ivAppIcon.setImageDrawable(pm.getApplicationIcon(packageName))
        } catch (e: PackageManager.NameNotFoundException) {
            binding.tvAppName.text = packageName
        }

        // Today's breakdown: cellular total, active (foreground), background
        viewModel.dailyUsage.observe(viewLifecycleOwner) { rows ->
            val row = rows.firstOrNull() ?: return@observe
            binding.tvCellularBreakdown.text =
                "Cellular total:   ${FormatUtils.formatBytes(row.cellularBytes)}"
            binding.tvActiveBreakdown.text =
                "Active:              ${FormatUtils.formatBytes(row.activeBytes)}"
            binding.tvBackgroundBreakdown.text =
                "Background:     ${FormatUtils.formatBytes(row.backgroundBytes)}"
            // Hide WiFi field — not tracked
            binding.tvWifiBreakdown.visibility = View.GONE

            // Hourly chart: single bar representing today's total (daily granularity in DB)
            val entries = listOf(BarEntry(0f, row.cellularBytes / (1024f * 1024f)))
            val dataSet = BarDataSet(entries, "Today (MB)").apply {
                color = 0xFFF5A623.toInt()
            }
            binding.hourlyChart.apply {
                data = BarData(dataSet)
                description.isEnabled = false
                setBackgroundColor(0xFF1A2C3D.toInt())
                axisLeft.textColor = 0xFFF0F4F8.toInt()
                xAxis.textColor = 0xFFF0F4F8.toInt()
                axisRight.isEnabled = false
                legend.textColor = 0xFFF0F4F8.toInt()
                invalidate()
            }
        }

        // 7-day cellular chart
        viewModel.weeklyUsage.observe(viewLifecycleOwner) { weeklyData ->
            if (weeklyData.isEmpty()) return@observe

            val dailyTotals = weeklyData.mapIndexed { index, entity ->
                BarEntry(index.toFloat(), entity.cellularBytes / (1024f * 1024f))
            }
            val dataSet = BarDataSet(dailyTotals, "7-Day Cellular (MB)").apply {
                color = 0xFF2ECC9A.toInt()
            }
            binding.weeklyChart.apply {
                data = BarData(dataSet)
                description.isEnabled = false
                setBackgroundColor(0xFF1A2C3D.toInt())
                axisLeft.textColor = 0xFFF0F4F8.toInt()
                xAxis.textColor = 0xFFF0F4F8.toInt()
                axisRight.isEnabled = false
                legend.textColor = 0xFFF0F4F8.toInt()
                invalidate()
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
