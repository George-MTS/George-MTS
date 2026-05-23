import Foundation

@MainActor
final class SettingsViewModel: ObservableObject {
    @Published var dailyThresholdMB: String = "500"
    @Published var notificationsEnabled: Bool = true
    @Published var showResetConfirmation: Bool = false

    private let dataService = DataUsageService.shared

    init() {
        loadSettings()
    }

    private func loadSettings() {
        guard let data = KeychainService.shared.load(forKey: "alertThreshold"),
              let threshold = EncryptionService.shared.decryptCodable(data, as: AlertThreshold.self) else {
            return
        }
        dailyThresholdMB = String(format: "%.0f", threshold.dailyThresholdMB)
        notificationsEnabled = threshold.notificationsEnabled
    }

    func saveSettings() {
        let threshold = AlertThreshold(
            dailyThresholdMB: Double(dailyThresholdMB) ?? 500,
            perAppThresholdMB: 50,
            notificationsEnabled: notificationsEnabled
        )
        if let data = EncryptionService.shared.encryptCodable(threshold) {
            KeychainService.shared.save(data, forKey: "alertThreshold")
        }
    }

    func resetAllData() {
        dataService.resetAllData()
        showResetConfirmation = false
    }
}
