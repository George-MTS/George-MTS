package com.datawatch.android.ui.settings

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.datawatch.android.databinding.FragmentSettingsBinding

class SettingsFragment : Fragment() {
    private var _binding: FragmentSettingsBinding? = null
    private val binding get() = _binding!!
    private val viewModel: SettingsViewModel by viewModels()

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
            }
        }

        binding.switchNotifications.setOnCheckedChangeListener { _, checked ->
            viewModel.toggleNotifications(checked)
        }

        binding.btnResetData.setOnClickListener {
            MaterialAlertDialogBuilder(requireContext())
                .setTitle("Reset All Data")
                .setMessage("This will delete all tracked usage history. This cannot be undone.")
                .setPositiveButton("Reset") { _, _ -> viewModel.resetAllData() }
                .setNegativeButton("Cancel", null)
                .show()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
