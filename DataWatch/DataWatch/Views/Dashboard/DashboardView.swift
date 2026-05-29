import SwiftUI

struct DashboardView: View {
    @ObservedObject var viewModel: DashboardViewModel

    var body: some View {
        NavigationStack {
            ZStack {
                Color.dwBackground.ignoresSafeArea()
                ScrollView {
                    VStack(spacing: 20) {
                        PrivacyShieldView(lastRefreshDate: viewModel.lastRefreshDate)

                        HStack(spacing: 12) {
                            DataUsageCard(title: "Cellular",
                                          value: viewModel.formattedCellular,
                                          icon: "antenna.radiowaves.left.and.right",
                                          color: Color.dwTeal)
                            DataUsageCard(title: "Wi-Fi",
                                          value: viewModel.formattedWifi,
                                          icon: "wifi",
                                          color: Color.dwAmber)
                        }
                        .padding(.horizontal, 20)

                        BundleProgressView(remainingPercentage: viewModel.bundleRemainingPercentage)

                        VStack(alignment: .leading, spacing: 12) {
                            Text("Top Apps Today")
                                .font(.system(.headline, design: .default, weight: .semibold))
                                .foregroundColor(Color.dwWarmWhite)
                                .padding(.horizontal, 20)

                            if viewModel.isLoading {
                                ProgressView()
                                    .tint(Color.dwTeal)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 40)
                            } else if viewModel.topApps.isEmpty {
                                topAppsEmptyState
                            } else {
                                LazyVStack(spacing: 8) {
                                    ForEach(viewModel.topApps) { app in
                                        NavigationLink(destination: AppDetailView(app: app)) {
                                            AppUsageRow(app: app,
                                                        maxBytes: viewModel.topApps.first?.totalBytes ?? 1)
                                        }
                                        .buttonStyle(.plain)
                                    }
                                }
                                .padding(.horizontal, 20)
                            }
                        }
                    }
                    .padding(.vertical, 20)
                }
                .refreshable { viewModel.refresh() }
            }
            .navigationTitle("DataWatch")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button { viewModel.refresh() } label: {
                        Image(systemName: "arrow.clockwise")
                            .foregroundColor(Color.dwTeal)
                    }
                }
            }
        }
    }

    private var topAppsEmptyState: some View {
        VStack(spacing: 10) {
            Image(systemName: "antenna.radiowaves.left.and.right")
                .font(.system(size: 34))
                .foregroundColor(Color.dwWarmWhite.opacity(0.2))
            Text("Monitoring your data")
                .font(.system(.subheadline, design: .default, weight: .semibold))
                .foregroundColor(Color.dwWarmWhite.opacity(0.5))
            Text("Usage will appear here shortly")
                .font(.system(.caption))
                .foregroundColor(Color.dwWarmWhite.opacity(0.3))
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 48)
        .padding(.horizontal, 20)
    }
}
