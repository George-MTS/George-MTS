package com.datawatch.android.ui.settings

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.fragment.app.viewModels
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.datawatch.android.databinding.FragmentSettingsBinding
import com.datawatch.android.ui.dashboard.DashboardViewModel

class SettingsFragment : Fragment() {
    private var _binding: FragmentSettingsBinding? = null
    private val binding get() = _binding!!
    private val viewModel: SettingsViewModel by viewModels()

    // Share the DashboardViewModel so reset clears its in-memory state immediately.
    private val dashboardViewModel: DashboardViewModel by activityViewModels()

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentSettingsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        viewModel.dailyThreshold.observe(viewLifecycleOwner) { threshold ->
            binding.etDailyThreshold.setText(threshold.toString())
        }

        viewModel.notificationsEnabled.observe(viewLifecycleOwner) { enabled ->
            binding.switchNotifications.isChecked = enabled
        }

        binding.btnSaveThreshold.setOnClickListener {
            val input = binding.etDailyThreshold.text.toString().toLongOrNull()
            if (input != null && input > 0) {
                viewModel.setDailyThreshold(input)
                Toast.makeText(requireContext(), "Threshold saved", Toast.LENGTH_SHORT).show()
            }
        }

        binding.switchNotifications.setOnCheckedChangeListener { _, checked ->
            viewModel.toggleNotifications(checked)
        }

        binding.btnResetData.setOnClickListener {
            MaterialAlertDialogBuilder(requireContext())
                .setTitle("Reset All Data")
                .setMessage(
                    "This will permanently clear all tracked cellular usage history. " +
                    "The app will begin monitoring fresh from this moment.\n\n" +
                    "Your threshold and notification settings are kept.\n\n" +
                    "This cannot be undone."
                )
                .setPositiveButton("Reset Now") { _, _ -> viewModel.resetAllData() }
                .setNegativeButton("Cancel", null)
                .show()
        }

        // FIX 1: when reset completes, immediately clear the DashboardViewModel's in-memory
        // summary so the UI shows the clean empty state without waiting for the next LiveData tick.
        viewModel.resetComplete.observe(viewLifecycleOwner) { complete ->
            if (complete == true) {
                dashboardViewModel.onResetPerformed()
                Toast.makeText(
                    requireContext(),
                    "Data reset. Monitoring fresh from now.",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
