import Foundation

@MainActor
final class AppDetailViewModel: ObservableObject {
    @Published var hourlyUsage: [HourlyUsage] = []
    @Published var dailyUsage: [DailyUsage] = []
    @Published var app: AppUsageModel

    private let dataService = DataUsageService.shared

    init(app: AppUsageModel) {
        self.app = app
        loadData()
    }

    private func loadData() {
        hourlyUsage = dataService.getHourlyUsage(for: app.bundleIdentifier)
        dailyUsage = dataService.getDailyUsage(for: app.bundleIdentifier)
    }

    var backgroundPercentageString: String {
        String(format: "%.0f%%", app.backgroundPercentage * 100)
    }

    var foregroundPercentageString: String {
        String(format: "%.0f%%", (1 - app.backgroundPercentage) * 100)
    }
}
