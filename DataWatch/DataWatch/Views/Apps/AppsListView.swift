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
                .listStyle(.plain)
                .scrollContentBackground(.hidden)
                .searchable(text: $searchText, prompt: "Search apps")
            }
            .navigationTitle("All Apps")
            .navigationBarTitleDisplayMode(.large)
        }
    }
}
