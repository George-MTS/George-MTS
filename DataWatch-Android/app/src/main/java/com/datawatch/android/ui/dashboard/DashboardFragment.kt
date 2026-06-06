package com.datawatch.android.ui.dashboard

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.datawatch.android.adapters.AppUsageAdapter
import com.datawatch.android.databinding.FragmentDashboardBinding
import com.datawatch.android.utils.FormatUtils
import com.datawatch.android.utils.PermissionHelper
import java.text.SimpleDateFormat
import java.util.*

class DashboardFragment : Fragment() {
    private var _binding: FragmentDashboardBinding? = null
    private val binding get() = _binding!!

    // activityViewModels so SettingsFragment can trigger reset on the same instance.
    private val viewModel: DashboardViewModel by activityViewModels()
    private lateinit var adapter: AppUsageAdapter

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

    private fun observeViewModel() {
        viewModel.appUsageList.observe(viewLifecycleOwner) { apps ->
            adapter.submitList(apps)
            val isEmpty = apps.isEmpty()
            binding.emptyState.visibility = if (isEmpty) View.VISIBLE else View.GONE
            binding.rvAppUsage.visibility = if (isEmpty) View.GONE else View.VISIBLE
        }

        // FIX 1: when reset fires, immediately show the empty state.
        viewModel.resetSignal.observe(viewLifecycleOwner) { reset ->
            if (reset == true) {
                adapter.submitList(emptyList())
                binding.emptyState.visibility = View.VISIBLE
                binding.rvAppUsage.visibility = View.GONE
            }
        }

        viewModel.summary.observe(viewLifecycleOwner) { summary ->
            // FIX 5: percentage = (totalCellularBytes / thresholdBytes) * 100, correct units
            binding.tvCellularUsage.text = FormatUtils.formatBytes(summary.totalCellularBytes)
            val percentage = (summary.usagePercentage * 100).toInt()
            binding.circularProgress.progress = percentage
            binding.tvProgressPercent.text = "$percentage%"
            binding.tvThreshold.text = "of ${FormatUtils.formatMB(summary.thresholdMB)} Safaricom limit"
        }

        viewModel.isLoading.observe(viewLifecycleOwner) { loading ->
            binding.swipeRefresh.isRefreshing = loading
        }

        // FIX 5: timestamp updated by the 30-second periodic job in DashboardViewModel.
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
