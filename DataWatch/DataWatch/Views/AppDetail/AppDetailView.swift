import SwiftUI

struct AppDetailView: View {
    let app: AppUsageModel
    @StateObject private var viewModel: AppDetailViewModel

    init(app: AppUsageModel) {
        self.app = app
        _viewModel = StateObject(wrappedValue: AppDetailViewModel(app: app))
    }

    var body: some View {
        ZStack {
            Color.dwBackground.ignoresSafeArea()
            ScrollView {
                VStack(spacing: 20) {
                    headerCard
                    usageSplitCard
                    hourlyCard
                    weeklyCard
                }
                .padding(.vertical, 20)
            }
        }
        .navigationTitle(app.displayName)
        .navigationBarTitleDisplayMode(.large)
    }

    private var headerCard: some View {
        HStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(Color.dwTeal.opacity(0.18))
                    .frame(width: 56, height: 56)
                Image(systemName: app.iconName)
                    .foregroundColor(Color.dwTeal)
                    .font(.system(size: 22, weight: .medium))
            }
            VStack(alignment: .leading, spacing: 4) {
                Text(app.displayName)
                    .font(.system(.title3, design: .default, weight: .bold))
                    .foregroundColor(Color.dwWarmWhite)
                Text("Total today: \(app.formattedTotal)")
                    .font(.system(.subheadline))
                    .foregroundColor(Color.dwTeal)
                Text(app.bundleIdentifier)
                    .font(.system(.caption2))
                    .foregroundColor(Color.dwWarmWhite.opacity(0.35))
                    .lineLimit(1)
            }
            Spacer()
        }
        .cardStyle()
        .padding(.horizontal, 20)
    }

    private var usageSplitCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Usage Breakdown")
                .font(.system(.headline, design: .default, weight: .semibold))
                .foregroundColor(Color.dwWarmWhite)
            HStack(spacing: 20) {
                usageChip(label: "Cellular", value: app.formattedCellular,
                          icon: "antenna.radiowaves.left.and.right", color: Color.dwTeal)
                usageChip(label: "Wi-Fi", value: app.formattedWifi,
                          icon: "wifi", color: Color.dwAmber)
            }
            Divider().background(Color.dwWarmWhite.opacity(0.1))
            HStack(spacing: 20) {
                usageChip(label: "Foreground", value: viewModel.foregroundPercentageString,
                          icon: "sun.max.fill", color: Color.dwTeal)
                usageChip(label: "Background", value: viewModel.backgroundPercentageString,
                          icon: "moon.fill", color: Color.dwAmber)
            }
        }
        .cardStyle()
        .padding(.horizontal, 20)
    }

    private func usageChip(label: String, value: String, icon: String, color: Color) -> some View {
        HStack(spacing: 8) {
            Image(systemName: icon).foregroundColor(color).font(.system(size: 13))
            VStack(alignment: .leading, spacing: 2) {
                Text(value)
                    .font(.system(.subheadline, design: .default, weight: .semibold))
                    .foregroundColor(Color.dwWarmWhite)
                Text(label)
                    .font(.system(.caption2))
                    .foregroundColor(Color.dwWarmWhite.opacity(0.5))
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var hourlyCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Hourly Usage Today")
                .font(.system(.headline, design: .default, weight: .semibold))
                .foregroundColor(Color.dwWarmWhite)
            HourlyChartView(data: viewModel.hourlyUsage)
                .frame(height: 120)
        }
        .cardStyle()
        .padding(.horizontal, 20)
    }

    private var weeklyCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Past 7 Days")
                .font(.system(.headline, design: .default, weight: .semibold))
                .foregroundColor(Color.dwWarmWhite)
            WeeklyChartView(data: viewModel.dailyUsage)
                .frame(height: 120)
        }
        .cardStyle()
        .padding(.horizontal, 20)
    }
}
