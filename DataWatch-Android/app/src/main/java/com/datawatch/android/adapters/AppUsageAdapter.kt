package com.datawatch.android.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.datawatch.android.databinding.ItemAppUsageBinding
import com.datawatch.android.models.AppUsageModel
import com.datawatch.android.utils.FormatUtils

// BUG 3 FIX: expandable cards — each app appears exactly once. Tapping expands a detail
// section showing cellular/WiFi/foreground/background breakdown. Expanded state is tracked
// by packageName so it survives list re-submissions without visual glitches.
class AppUsageAdapter(
    private val onItemClick: (String) -> Unit
) : ListAdapter<AppUsageModel, AppUsageAdapter.ViewHolder>(DIFF_CALLBACK) {

    private val expandedItems = mutableSetOf<String>()

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemAppUsageBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class ViewHolder(private val binding: ItemAppUsageBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(item: AppUsageModel) {
            binding.ivAppIcon.setImageDrawable(item.appIcon)
            binding.tvAppName.text = item.appName
            binding.tvTotalUsage.text = FormatUtils.formatBytes(item.totalBytes)

            val isExpanded = item.packageName in expandedItems
            binding.expandedSection.visibility = if (isExpanded) View.VISIBLE else View.GONE
            binding.ivExpandArrow.rotation = if (isExpanded) 180f else 0f

            if (isExpanded) {
                binding.tvCellularDetail.text = "Cellular  ${FormatUtils.formatBytes(item.cellularBytes)}"
                binding.tvWifiDetail.text = "WiFi          ${FormatUtils.formatBytes(item.wifiBytes)}"
                binding.tvForegroundDetail.text = "Foreground  ${FormatUtils.formatBytes(item.foregroundBytes)}"
                binding.tvBackgroundDetail.text = "Background  ${FormatUtils.formatBytes(item.backgroundBytes)}"
            }

            binding.root.setOnClickListener {
                val pkg = item.packageName
                if (expandedItems.contains(pkg)) expandedItems.remove(pkg)
                else expandedItems.add(pkg)
                notifyItemChanged(bindingAdapterPosition)
            }

            binding.root.setOnLongClickListener {
                onItemClick(item.packageName)
                true
            }
        }
    }

    companion object {
        val DIFF_CALLBACK = object : DiffUtil.ItemCallback<AppUsageModel>() {
            override fun areItemsTheSame(a: AppUsageModel, b: AppUsageModel) =
                a.packageName == b.packageName
            override fun areContentsTheSame(a: AppUsageModel, b: AppUsageModel) = a == b
        }
    }
}
