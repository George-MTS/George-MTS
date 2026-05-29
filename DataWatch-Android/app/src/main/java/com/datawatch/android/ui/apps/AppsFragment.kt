package com.datawatch.android.ui.apps

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.datawatch.android.adapters.AppUsageAdapter
import com.datawatch.android.databinding.FragmentAppsBinding

class AppsFragment : Fragment() {
    private var _binding: FragmentAppsBinding? = null
    private val binding get() = _binding!!
    private val viewModel: AppsViewModel by viewModels()
    private lateinit var adapter: AppUsageAdapter

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentAppsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        adapter = AppUsageAdapter { packageName ->
            val action = AppsFragmentDirections.actionAppsToAppDetail(packageName)
            findNavController().navigate(action)
        }
        binding.rvApps.layoutManager = LinearLayoutManager(requireContext())
        binding.rvApps.adapter = adapter

        viewModel.appUsageList.observe(viewLifecycleOwner) { apps ->
            adapter.submitList(apps)
            binding.emptyState.visibility = if (apps.isEmpty()) View.VISIBLE else View.GONE
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
