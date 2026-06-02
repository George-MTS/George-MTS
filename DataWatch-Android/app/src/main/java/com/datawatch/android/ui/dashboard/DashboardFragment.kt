package com.datawatch.android.ui.dashboard

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.datawatch.android.adapters.AppUsageAdapter
import com.datawatch.android.databinding.FragmentDashboardBinding
import com.datawatch.android.models.AppUsageModel
import com.datawatch.android.utils.FormatUtils
import com.datawatch.android.utils.PermissionHelper
import java.text.SimpleDateFormat
import java.util.*

class DashboardFragment : Fragment() {
    private var _binding: FragmentDashboardBinding? = null
    private val binding get() = _binding!!
    private val viewModel: DashboardViewModel by viewModels()
    private lateinit var adapter: AppUsageAdapter
    private var latestList: List<AppUsageModel> = emptyList()

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentDashboardBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        if (!PermissionHelper.hasUsageStatsPermission(requireContext())) {
            binding.permissionBanner.visibility = View.VISIBLE
            binding.permissionBanner.setOnClickListener {
                PermissionHelper.openUsageAccessSettings(requireContext())
            }
        }

        setupRecyclerView()
        setupFilterChips()
        observeViewModel()

        binding.swipeRefresh.setOnRefreshListener { viewModel.refresh() }
    }

    private fun setupRecyclerView() {
        adapter = AppUsageAdapter { packageName ->
            val action = DashboardFragmentDirections.actionDashboardToAppDetail(packageName)
            findNavController().navigate(action)
        }
        binding.rvAppUsage.layoutManager = LinearLayoutManager(requireContext())
        binding.rvAppUsage.adapter = adapter
    }

    // BUG 2 FIX: filter chips let users isolate cellular-only or WiFi-only data.
    private fun setupFilterChips() {
        binding.chipAll.setOnClickListener { viewModel.setFilter(UsageFilter.ALL) }
        binding.chipCellular.setOnClickListener { viewModel.setFilter(UsageFilter.CELLULAR) }
        binding.chipWifi.setOnClickListener { viewModel.setFilter(UsageFilter.WIFI) }
    }

    private fun applyFilter(list: List<AppUsageModel>, filter: UsageFilter): List<AppUsageModel> {
        return when (filter) {
            UsageFilter.ALL -> list
            UsageFilter.CELLULAR -> list
                .filter { it.cellularBytes > 0 }
                .sortedByDescending { it.cellularBytes }
            UsageFilter.WIFI -> list
                .filter { it.wifiBytes > 0 }
                .sortedByDescending { it.wifiBytes }
        }
    }

    private fun submitFiltered() {
        val filter = viewModel.filter.value ?: UsageFilter.ALL
        val filtered = applyFilter(latestList, filter)
        adapter.submitList(filtered)
        binding.emptyState.visibility = if (filtered.isEmpty()) View.VISIBLE else View.GONE
        binding.rvAppUsage.visibility = if (filtered.isEmpty()) View.GONE else View.VISIBLE
    }

    private fun observeViewModel() {
        viewModel.appUsageList.observe(viewLifecycleOwner) { apps ->
            latestList = apps
            submitFiltered()
        }

        // Re-submit when filter changes without waiting for a new DB emission.
        viewModel.filter.observe(viewLifecycleOwner) { filter ->
            binding.chipAll.isSelected = filter == UsageFilter.ALL
            binding.chipCellular.isSelected = filter == UsageFilter.CELLULAR
            binding.chipWifi.isSelected = filter == UsageFilter.WIFI
            submitFiltered()
        }

        viewModel.summary.observe(viewLifecycleOwner) { summary ->
            binding.tvCellularUsage.text = FormatUtils.formatBytes(summary.totalCellularBytes)
            binding.tvWifiUsage.text = FormatUtils.formatBytes(summary.totalWifiBytes)
            val percentage = (summary.usagePercentage * 100).toInt()
            binding.circularProgress.progress = percentage
            binding.tvProgressPercent.text = "$percentage%"
            binding.tvThreshold.text = "of ${FormatUtils.formatMB(summary.thresholdMB)} limit (cellular)"
        }

        viewModel.isLoading.observe(viewLifecycleOwner) { loading ->
            binding.swipeRefresh.isRefreshing = loading
        }

        viewModel.lastUpdated.observe(viewLifecycleOwner) { timestamp ->
            val fmt = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
            binding.tvLastUpdated.text = "Updated ${fmt.format(Date(timestamp))}"
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
