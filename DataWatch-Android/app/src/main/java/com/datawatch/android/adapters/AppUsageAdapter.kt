package com.datawatch.android.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.datawatch.android.databinding.ItemAppUsageBinding
import com.datawatch.android.models.AppUsageModel
import com.datawatch.android.utils.FormatUtils

// FIX 3 + FIX 4 + FIX 6:
// - Each app appears exactly once (enforced upstream by HashMap<UID> in NetworkStatsService
//   and composite PK in Room). The adapter is a pure display layer — no dedup needed here.
// - Active (foreground cellular) and Background cellular shown as always-visible labelled lines.
// - Tap navigates to AppDetailFragment for full chart view.
// - WiFi references removed entirely.
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

    inner class ViewHolder(private val binding: ItemAppUsageBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(item: AppUsageModel) {
            binding.ivAppIcon.setImageDrawable(item.appIcon)
            binding.tvAppName.text = item.appName
            // FIX 5: FormatUtils.formatBytes handles B/KB/MB/GB correctly
            binding.tvTotalUsage.text = FormatUtils.formatBytes(item.cellularBytes)
            // FIX 4: Active and Background always visible, never combined
            binding.tvActiveUsage.text = "Active       ${FormatUtils.formatBytes(item.activeBytes)}"
            binding.tvBackgroundUsage.text = "Background  ${FormatUtils.formatBytes(item.backgroundBytes)}"

            binding.root.setOnClickListener { onItemClick(item.packageName) }
        }
    }

    companion object {
        val DIFF_CALLBACK = object : DiffUtil.ItemCallback<AppUsageModel>() {
            override fun areItemsTheSame(a: AppUsageModel, b: AppUsageModel) =
                a.packageName == b.packageName
            override fun areContentsTheSame(a: AppUsageModel, b: AppUsageModel) =
                a.cellularBytes == b.cellularBytes &&
                a.activeBytes == b.activeBytes &&
                a.backgroundBytes == b.backgroundBytes
        }
    }
}
