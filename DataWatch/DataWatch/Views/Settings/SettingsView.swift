import SwiftUI

struct SettingsView: View {
    @ObservedObject var viewModel: SettingsViewModel

    var body: some View {
        NavigationStack {
            ZStack {
                Color.dwBackground.ignoresSafeArea()
                Form {
                    // MARK: Alerts
                    Section {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Daily Threshold")
                                    .foregroundColor(Color.dwWarmWhite)
                                Text("Alert when daily cellular exceeds this")
                                    .font(.caption)
                                    .foregroundColor(Color.dwWarmWhite.opacity(0.5))
                            }
                            Spacer()
                            TextField("500", text: $viewModel.dailyThresholdMB)
                                .keyboardType(.numberPad)
                                .multilineTextAlignment(.trailing)
                                .foregroundColor(Color.dwTeal)
                                .frame(width: 60)
                            Text("MB")
                                .foregroundColor(Color.dwWarmWhite.opacity(0.5))
                        }
                        .listRowBackground(Color.dwCardBg)
                        .onChange(of: viewModel.dailyThresholdMB) { _ in viewModel.saveSettings() }

                        Toggle(isOn: $viewModel.notificationsEnabled) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Notifications")
                                    .foregroundColor(Color.dwWarmWhite)
                                Text("Alert when thresholds are exceeded")
                                    .font(.caption)
                                    .foregroundColor(Color.dwWarmWhite.opacity(0.5))
                            }
                        }
                        .tint(Color.dwAmber)
                        .listRowBackground(Color.dwCardBg)
                        .onChange(of: viewModel.notificationsEnabled) { _ in viewModel.saveSettings() }
                    } header: {
                        Text("ALERTS").foregroundColor(Color.dwWarmWhite.opacity(0.5))
                    }

                    // MARK: Privacy
                    Section {
                        Label("All data stored locally on device", systemImage: "lock.shield.fill")
                            .foregroundColor(Color.dwAmber)
                            .listRowBackground(Color.dwCardBg)
                        Label("AES-256 encrypted via CryptoKit", systemImage: "key.fill")
                            .foregroundColor(Color.dwAmber)
                            .listRowBackground(Color.dwCardBg)
                        Label("No external connections ever made", systemImage: "xmark.circle.fill")
                            .foregroundColor(Color.dwAmber)
                            .listRowBackground(Color.dwCardBg)
                        Label("No account or login required", systemImage: "person.slash")
                            .foregroundColor(Color.dwAmber)
                            .listRowBackground(Color.dwCardBg)
                    } header: {
                        Text("PRIVACY").foregroundColor(Color.dwWarmWhite.opacity(0.5))
                    }

                    // MARK: Danger zone
                    Section {
                        Button(role: .destructive) {
                            viewModel.showResetConfirmation = true
                        } label: {
                            Label("Reset All Data", systemImage: "trash.fill")
                        }
                        .listRowBackground(Color.dwCardBg)
                    } header: {
                        Text("DATA").foregroundColor(Color.dwWarmWhite.opacity(0.5))
                    }
                }
                .scrollContentBackground(.hidden)
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.large)
            .alert("Reset All Data?", isPresented: $viewModel.showResetConfirmation) {
                Button("Reset", role: .destructive) { viewModel.resetAllData() }
                Button("Cancel", role: .cancel) {}
            } message: {
                Text("All tracked usage data will be permanently deleted.")
            }
        }
    }
}
