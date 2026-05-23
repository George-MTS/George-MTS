import XCTest
@testable import DataWatch

final class DataUsageServiceTests: XCTestCase {

    func testRefreshProducesNonEmptyResults() {
        let service = DataUsageService.shared
        service.refreshUsageData()
        let expectation = XCTestExpectation(description: "Apps populated")
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            XCTAssertFalse(service.appUsages.isEmpty, "App usages should not be empty after refresh")
            expectation.fulfill()
        }
        wait(for: [expectation], timeout: 2)
    }

    func testAppsAreSortedByTotalBytesDescending() {
        let service = DataUsageService.shared
        service.refreshUsageData()
        let expectation = XCTestExpectation(description: "Apps sorted")
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            let apps = service.appUsages
            for i in 0..<(apps.count - 1) {
                XCTAssertGreaterThanOrEqual(apps[i].totalBytes, apps[i + 1].totalBytes,
                    "Apps should be sorted highest first")
            }
            expectation.fulfill()
        }
        wait(for: [expectation], timeout: 2)
    }

    func testHourlyUsageReturnsCurrentHours() {
        let service = DataUsageService.shared
        let hourly = service.getHourlyUsage(for: "com.test.app")
        let currentHour = Calendar.current.component(.hour, from: Date())
        XCTAssertEqual(hourly.count, currentHour + 1, "Should return data from hour 0 through current hour")
    }

    func testDailyUsageReturnsSeven() {
        let service = DataUsageService.shared
        let daily = service.getDailyUsage(for: "com.test.app")
        XCTAssertEqual(daily.count, 7, "Should return exactly 7 days of data")
    }

    func testTotalsArePositive() {
        let service = DataUsageService.shared
        service.refreshUsageData()
        let expectation = XCTestExpectation(description: "Totals positive")
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            XCTAssertGreaterThan(service.totalCellularToday, 0)
            XCTAssertGreaterThan(service.totalWifiToday, 0)
            expectation.fulfill()
        }
        wait(for: [expectation], timeout: 2)
    }
}
