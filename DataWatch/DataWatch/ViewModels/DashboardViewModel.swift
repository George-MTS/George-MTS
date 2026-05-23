import Foundation
import Combine

@MainActor
final class DashboardViewModel: ObservableObject {
    @Published var topApps: [AppUsageModel] = []
    @Published var totalCellularToday: Int64 = 0
    @Published var totalWifiToday: Int64 = 0
    @Published var lastRefreshDate: Date = Date()
    @Published var bundleRemainingPercentage: Double = 0.72
    @Published var isLoading: Bool = false

    private let dataService = DataUsageService.shared
    private var cancellables = Set<AnyCancellable>()

    init() {
        bindToDataService()
    }

    private func bindToDataService() {
        dataService.$appUsages
            .receive(on: RunLoop.main)
            .sink { [weak self] apps in
                self?.topApps = Array(apps.prefix(10))
            }
            .store(in: &cancellables)

        dataService.$totalCellularToday
            .receive(on: RunLoop.main)
            .sink { [weak self] value in self?.totalCellularToday = value }
            .store(in: &cancellables)

        dataService.$totalWifiToday
            .receive(on: RunLoop.main)
            .sink { [weak self] value in self?.totalWifiToday = value }
            .store(in: &cancellables)

        dataService.$lastRefreshDate
            .receive(on: RunLoop.main)
            .sink { [weak self] value in self?.lastRefreshDate = value }
            .store(in: &cancellables)

        dataService.$isLoading
            .receive(on: RunLoop.main)
            .sink { [weak self] value in self?.isLoading = value }
            .store(in: &cancellables)
    }

    func refresh() {
        dataService.refreshUsageData()
    }

    var formattedCellular: String {
        ByteCountFormatter.string(fromByteCount: totalCellularToday, countStyle: .binary)
    }

    var formattedWifi: String {
        ByteCountFormatter.string(fromByteCount: totalWifiToday, countStyle: .binary)
    }

    var formattedLastRefresh: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: lastRefreshDate, relativeTo: Date())
    }
}
