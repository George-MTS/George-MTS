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
}
