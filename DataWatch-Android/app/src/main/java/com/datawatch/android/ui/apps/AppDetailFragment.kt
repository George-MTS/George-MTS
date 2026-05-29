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

        viewModel.hourlyUsage.observe(viewLifecycleOwner) { hourlyData ->
            if (hourlyData.isEmpty()) return@observe

            val entries = hourlyData.map { entity ->
                BarEntry(entity.hour.toFloat(), (entity.cellularBytes + entity.wifiBytes) / (1024f * 1024f))
            }
            val dataSet = BarDataSet(entries, "Data Usage (MB)").apply {
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

            val totalCellular = hourlyData.sumOf { it.cellularBytes }
            val totalWifi = hourlyData.sumOf { it.wifiBytes }
            val totalForeground = hourlyData.sumOf { it.foregroundBytes }
            val totalBackground = hourlyData.sumOf { it.backgroundBytes }

            binding.tvCellularBreakdown.text = "Cellular: ${FormatUtils.formatBytes(totalCellular)}"
            binding.tvWifiBreakdown.text = "WiFi: ${FormatUtils.formatBytes(totalWifi)}"
            binding.tvForegroundBreakdown.text = "Foreground: ${FormatUtils.formatBytes(totalForeground)}"
            binding.tvBackgroundBreakdown.text = "Background: ${FormatUtils.formatBytes(totalBackground)}"
        }

        viewModel.weeklyUsage.observe(viewLifecycleOwner) { weeklyData ->
            if (weeklyData.isEmpty()) return@observe

            val dailyTotals = weeklyData.groupBy { it.date }
                .entries.mapIndexed { index, (_, entities) ->
                    BarEntry(index.toFloat(), entities.sumOf { it.cellularBytes + it.wifiBytes } / (1024f * 1024f))
                }
            val dataSet = BarDataSet(dailyTotals, "7-Day Usage (MB)").apply {
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
