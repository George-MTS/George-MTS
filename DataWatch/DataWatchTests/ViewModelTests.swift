import XCTest
@testable import DataWatch

@MainActor
final class ViewModelTests: XCTestCase {

    func testDashboardViewModelTotalsAreNonNegative() async throws {
        let vm = DashboardViewModel()
        try await Task.sleep(nanoseconds: 600_000_000)
        XCTAssertGreaterThanOrEqual(vm.totalCellularToday, 0)
        XCTAssertGreaterThanOrEqual(vm.totalWifiToday, 0)
    }

    func testDashboardVMFormatsBytes() async throws {
        let vm = DashboardViewModel()
        try await Task.sleep(nanoseconds: 600_000_000)
        XCTAssertFalse(vm.formattedCellular.isEmpty)
        XCTAssertFalse(vm.formattedWifi.isEmpty)
    }

    func testDashboardTopAppsIsEmpty() async throws {
        let vm = DashboardViewModel()
        try await Task.sleep(nanoseconds: 600_000_000)
        XCTAssertTrue(vm.topApps.isEmpty,
            "Real data mode has no per-app breakdown (iOS sandbox limitation)")
    }

    func testAppDetailVMLoadsEmptyUsage() {
        let app = AppUsageModel(
            id: UUID(),
            bundleIdentifier: "com.test.app",
            displayName: "TestApp",
            iconName: "app",
            cellularBytesReceived: 0,
            cellularBytesSent: 0,
            wifiBytesReceived: 0,
            wifiBytesSent: 0,
            backgroundBytesTotal: 0,
            lastUpdated: Date(),
            isSystemApp: false
        )
        let vm = AppDetailViewModel(app: app)
        XCTAssertTrue(vm.hourlyUsage.isEmpty, "No per-app hourly data available on iOS")
        XCTAssertTrue(vm.dailyUsage.isEmpty, "No per-app daily data available on iOS")
    }

    func testSettingsVMDefaultValues() {
        let vm = SettingsViewModel()
        XCTAssertFalse(vm.dailyThresholdMB.isEmpty)
    }
}
