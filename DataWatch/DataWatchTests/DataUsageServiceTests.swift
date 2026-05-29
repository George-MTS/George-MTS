import XCTest
@testable import DataWatch

final class DataUsageServiceTests: XCTestCase {

    func testRefreshDoesNotCrash() {
        let service = DataUsageService.shared
        service.refreshUsageData()
        let expectation = XCTestExpectation(description: "Refresh completes without crash")
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            expectation.fulfill()
        }
        wait(for: [expectation], timeout: 2)
    }

    func testTotalsAreNonNegative() {
        let service = DataUsageService.shared
        service.refreshUsageData()
        let expectation = XCTestExpectation(description: "Totals are non-negative")
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            XCTAssertGreaterThanOrEqual(service.totalCellularToday, 0)
            XCTAssertGreaterThanOrEqual(service.totalWifiToday, 0)
            expectation.fulfill()
        }
        wait(for: [expectation], timeout: 2)
    }

    func testAppUsagesIsAlwaysEmpty() {
        let service = DataUsageService.shared
        service.refreshUsageData()
        let expectation = XCTestExpectation(description: "No per-app data on real mode")
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            XCTAssertTrue(service.appUsages.isEmpty,
                "Per-app breakdown is not available via the iOS sandbox")
            expectation.fulfill()
        }
        wait(for: [expectation], timeout: 2)
    }

    func testHourlyUsageReturnsEmpty() {
        let service = DataUsageService.shared
        let hourly = service.getHourlyUsage(for: "com.test.app")
        XCTAssertTrue(hourly.isEmpty, "No per-app hourly data available on iOS")
    }

    func testDailyUsageReturnsEmpty() {
        let service = DataUsageService.shared
        let daily = service.getDailyUsage(for: "com.test.app")
        XCTAssertTrue(daily.isEmpty, "No per-app daily data available on iOS")
    }

    func testResetClearsTotals() {
        let service = DataUsageService.shared
        service.resetAllData()
        let expectation = XCTestExpectation(description: "Totals cleared after reset")
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            XCTAssertEqual(service.totalCellularToday, 0)
            XCTAssertEqual(service.totalWifiToday, 0)
            XCTAssertTrue(service.appUsages.isEmpty)
            expectation.fulfill()
        }
        wait(for: [expectation], timeout: 2)
    }
}
