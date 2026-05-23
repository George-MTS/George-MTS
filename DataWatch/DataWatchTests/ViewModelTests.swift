import XCTest
@testable import DataWatch

@MainActor
final class ViewModelTests: XCTestCase {

    func testDashboardViewModelBindsToService() async throws {
        let vm = DashboardViewModel()
        try await Task.sleep(nanoseconds: 600_000_000)
        XCTAssertFalse(vm.topApps.isEmpty, "Dashboard VM should have apps after service refresh")
    }

    func testDashboardVMFormatsBytes() async throws {
        let vm = DashboardViewModel()
        try await Task.sleep(nanoseconds: 600_000_000)
        XCTAssertFalse(vm.formattedCellular.isEmpty)
        XCTAssertFalse(vm.formattedWifi.isEmpty)
    }

    func testDashboardTopAppsLimitedToTen() async throws {
        let vm = DashboardViewModel()
        try await Task.sleep(nanoseconds: 600_000_000)
        XCTAssertLessThanOrEqual(vm.topApps.count, 10, "Dashboard should show at most 10 apps")
    }

    func testAppDetailVMLoadsUsage() {
        let mockApp = AppUsageModel(
            id: UUID(),
            bundleIdentifier: "com.test.app",
            displayName: "TestApp",
            iconName: "app",
            cellularBytesReceived: 1_048_576,
            cellularBytesSent: 204_800,
            wifiBytesReceived: 2_097_152,
            wifiBytesSent: 102_400,
            backgroundBytesTotal: 512_000,
            lastUpdated: Date(),
            isSystemApp: false
        )
        let vm = AppDetailViewModel(app: mockApp)
        XCTAssertFalse(vm.hourlyUsage.isEmpty, "Hourly usage should be populated")
        XCTAssertEqual(vm.dailyUsage.count, 7, "Daily usage should have 7 entries")
    }

    func testSettingsVMDefaultValues() {
        let vm = SettingsViewModel()
        XCTAssertFalse(vm.dailyThresholdMB.isEmpty)
    }
}
