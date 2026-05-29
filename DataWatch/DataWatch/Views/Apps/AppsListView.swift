import SwiftUI

struct AppsListView: View {
    @ObservedObject private var dataService = DataUsageService.shared
    @State private var searchText = ""

    private var filteredApps: [AppUsageModel] {
        searchText.isEmpty
            ? dataService.appUsages
            : dataService.appUsages.filter { $0.displayName.localizedCaseInsensitiveContains(searchText) }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Color.dwBackground.ignoresSafeArea()
                List {
                    if filteredApps.isEmpty {
                        appsEmptyState
                    } else {
                        ForEach(filteredApps) { app in
                            NavigationLink(destination: AppDetailView(app: app)) {
                                AppUsageRow(app: app,
                                            maxBytes: dataService.appUsages.first?.totalBytes ?? 1)
                            }
                            .listRowBackground(Color.clear)
                            .listRowSeparator(.hidden)
                            .listRowInsets(EdgeInsets(top: 4, leading: 20, bottom: 4, trailing: 20))
                        }
                    }
                }
                .listStyle(.plain)
                .scrollContentBackground(.hidden)
                .searchable(text: $searchText, prompt: "Search apps")
            }
            .navigationTitle("All Apps")
            .navigationBarTitleDisplayMode(.large)
        }
    }

    private var appsEmptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "antenna.radiowaves.left.and.right")
                .font(.system(size: 44))
                .foregroundColor(Color.dwTeal.opacity(0.4))
                .padding(.top, 60)
            Text("Monitoring your data")
                .font(.system(.headline, design: .default, weight: .semibold))
                .foregroundColor(Color.dwWarmWhite)
            Text("Per-app usage will appear here\nonce iOS reports network activity")
                .font(.system(.subheadline))
                .foregroundColor(Color.dwWarmWhite.opacity(0.45))
                .multilineTextAlignment(.center)
                .padding(.bottom, 60)
        }
        .frame(maxWidth: .infinity)
        .listRowBackground(Color.clear)
        .listRowSeparator(.hidden)
        .listRowInsets(EdgeInsets())
    }
}
