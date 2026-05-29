package com.datawatch.android.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.datawatch.android.databinding.ItemAppUsageBinding
import com.datawatch.android.models.AppUsageModel
import com.datawatch.android.utils.FormatUtils

class AppUsageAdapter(
    private val onItemClick: (String) -> Unit
) : ListAdapter<AppUsageModel, AppUsageAdapter.ViewHolder>(DIFF_CALLBACK) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemAppUsageBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class ViewHolder(private val binding: ItemAppUsageBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(item: AppUsageModel) {
            binding.ivAppIcon.setImageDrawable(item.appIcon)
            binding.tvAppName.text = item.appName
            binding.tvTotalUsage.text = FormatUtils.formatBytes(item.totalBytes)
            binding.tvCellularUsage.text = "Cellular: ${FormatUtils.formatBytes(item.cellularBytes)}"
            binding.tvBackgroundUsage.text = "Background: ${FormatUtils.formatBytes(item.backgroundBytes)}"
            binding.root.setOnClickListener { onItemClick(item.packageName) }
        }
    }

    companion object {
        val DIFF_CALLBACK = object : DiffUtil.ItemCallback<AppUsageModel>() {
            override fun areItemsTheSame(a: AppUsageModel, b: AppUsageModel) = a.packageName == b.packageName
            override fun areContentsTheSame(a: AppUsageModel, b: AppUsageModel) = a == b
        }
    }
}
