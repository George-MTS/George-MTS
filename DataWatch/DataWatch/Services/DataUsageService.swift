import Foundation
import Combine

final class DataUsageService: ObservableObject {
    static let shared = DataUsageService()

    @Published var appUsages: [AppUsageModel] = []
    @Published var totalCellularToday: Int64 = 0
    @Published var totalWifiToday: Int64 = 0
    @Published var lastRefreshDate: Date = Date()
    @Published var isLoading: Bool = false

    private var refreshTimer: Timer?
    private let storage = CoreDataStack.shared

    private init() {
        loadCachedData()
        schedulePeriodicRefresh()
        refreshUsageData()
    }

    private func schedulePeriodicRefresh() {
        DispatchQueue.main.async {
            self.refreshTimer = Timer.scheduledTimer(withTimeInterval: 30, repeats: true) { [weak self] _ in
                self?.refreshUsageData()
            }
        }
    }

    func refreshUsageData() {
        DispatchQueue.main.async { self.isLoading = true }

        let mockData   = MockDataProvider.generateMockAppUsages()
        let sorted     = mockData.sorted { $0.totalBytes > $1.totalBytes }
        let cellular   = mockData.reduce(0) { $0 + $1.cellularBytes }
        let wifi       = mockData.reduce(0) { $0 + $1.wifiBytes }
        let now        = Date()

        DispatchQueue.main.async {
            self.appUsages           = sorted
            self.totalCellularToday  = cellular
            self.totalWifiToday      = wifi
            self.lastRefreshDate     = now
            self.isLoading           = false
        }

        NotificationService.shared.checkAndSendAlerts(appUsages: mockData, totalCellularToday: cellular)
        storage.saveUsageSnapshot(sorted)
    }

    private func loadCachedData() {
        let cached = storage.loadLatestSnapshot()
        guard !cached.isEmpty else { return }
        DispatchQueue.main.async {
            self.appUsages          = cached
            self.totalCellularToday = cached.reduce(0) { $0 + $1.cellularBytes }
            self.totalWifiToday     = cached.reduce(0) { $0 + $1.wifiBytes }
        }
    }

    func getHourlyUsage(for bundleIdentifier: String) -> [HourlyUsage] {
        MockDataProvider.generateHourlyUsage(for: bundleIdentifier)
    }

    func getDailyUsage(for bundleIdentifier: String) -> [DailyUsage] {
        MockDataProvider.generateDailyUsage(for: bundleIdentifier)
    }

    func resetAllData() {
        storage.clearAllData()
        DispatchQueue.main.async {
            self.appUsages          = []
            self.totalCellularToday = 0
            self.totalWifiToday     = 0
        }
    }
}
