import Darwin
import Foundation
import Combine

// MARK: - Network byte types (inlined to guarantee same-module compilation)

struct NetworkSnapshot {
    let wifi: Int64
    let cellular: Int64
    static let zero = NetworkSnapshot(wifi: 0, cellular: 0)
}

enum NetworkBytesReader {
    static func current() -> NetworkSnapshot {
        var ifaddrsPtr: UnsafeMutablePointer<ifaddrs>?
        guard getifaddrs(&ifaddrsPtr) == 0, let head = ifaddrsPtr else { return .zero }
        defer { freeifaddrs(ifaddrsPtr) }
        var wifi: Int64 = 0
        var cellular: Int64 = 0
        var ptr: UnsafeMutablePointer<ifaddrs>? = head
        while let iface = ptr {
            defer { ptr = iface.pointee.ifa_next }
            guard iface.pointee.ifa_addr?.pointee.sa_family == UInt8(AF_LINK),
                  let rawData = iface.pointee.ifa_data else { continue }
            let stats = rawData.assumingMemoryBound(to: if_data.self).pointee
            let total = Int64(stats.ifi_ibytes) + Int64(stats.ifi_obytes)
            let name  = String(cString: iface.pointee.ifa_name)
            if name.hasPrefix("en") { wifi += total }
            else if name.hasPrefix("pdp_ip") { cellular += total }
        }
        return NetworkSnapshot(wifi: wifi, cellular: cellular)
    }
}

// MARK: -

final class DataUsageService: ObservableObject {
    static let shared = DataUsageService()

    @Published var appUsages: [AppUsageModel] = []
    @Published var totalCellularToday: Int64 = 0
    @Published var totalWifiToday: Int64 = 0
    @Published var lastRefreshDate: Date = Date()
    @Published var isLoading: Bool = false

    private var refreshTimer: Timer?
    private let storage = CoreDataStack.shared

    // Cumulative bytes at the start of today (or app first-run today).
    // Stored in UserDefaults so it survives app restarts within the same calendar day.
    private var baseline = NetworkSnapshot.zero
    private var baselineDate = Date.distantPast

    private init() {
        restoreOrResetBaseline()
        schedulePeriodicRefresh()
        refreshUsageData()
    }

    // MARK: - Baseline management

    private func restoreOrResetBaseline() {
        let defaults = UserDefaults.standard
        if let saved = defaults.object(forKey: "dw.baselineDate") as? Date,
           Calendar.current.isDateInToday(saved) {
            baseline = NetworkSnapshot(
                wifi:     Int64(defaults.double(forKey: "dw.baselineWifi")),
                cellular: Int64(defaults.double(forKey: "dw.baselineCellular"))
            )
            baselineDate = saved
        } else {
            captureBaseline()
        }
    }

    private func captureBaseline() {
        baseline     = NetworkBytesReader.current()
        baselineDate = Date()
        let defaults = UserDefaults.standard
        defaults.set(Double(baseline.wifi),     forKey: "dw.baselineWifi")
        defaults.set(Double(baseline.cellular), forKey: "dw.baselineCellular")
        defaults.set(baselineDate,              forKey: "dw.baselineDate")
    }

    // MARK: - Refresh

    private func schedulePeriodicRefresh() {
        DispatchQueue.main.async {
            self.refreshTimer = Timer.scheduledTimer(withTimeInterval: 30, repeats: true) { [weak self] _ in
                self?.refreshUsageData()
            }
        }
    }

    func refreshUsageData() {
        DispatchQueue.main.async { self.isLoading = true }

        // Roll the baseline over at midnight
        if !Calendar.current.isDateInToday(baselineDate) {
            captureBaseline()
        }

        let current  = NetworkBytesReader.current()
        let cellular = max(0, current.cellular - baseline.cellular)
        let wifi     = max(0, current.wifi     - baseline.wifi)
        let now      = Date()

        DispatchQueue.main.async {
            self.totalCellularToday = cellular
            self.totalWifiToday     = wifi
            self.lastRefreshDate    = now
            self.isLoading          = false
        }

        NotificationService.shared.checkAndSendAlerts(appUsages: [], totalCellularToday: cellular)
    }

    // Per-app breakdown is not available in the iOS sandbox.
    func getHourlyUsage(for bundleIdentifier: String) -> [HourlyUsage] { [] }
    func getDailyUsage(for bundleIdentifier: String) -> [DailyUsage] { [] }

    func resetAllData() {
        storage.clearAllData()
        // Re-snapshot so the counter restarts from zero right now
        captureBaseline()
        DispatchQueue.main.async {
            self.appUsages          = []
            self.totalCellularToday = 0
            self.totalWifiToday     = 0
        }
    }
}
