import Foundation
import UserNotifications

final class NotificationService {
    static let shared = NotificationService()

    private var notifiedAppBundles: Set<String> = []
    private var dailyAlertSent: Bool = false

    private init() {
        scheduleDailyReset()
    }

    func requestPermission() {
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            guard settings.authorizationStatus == .notDetermined else { return }
            UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { _, _ in }
        }
    }

    private func scheduleDailyReset() {
        let calendar = Calendar.current
        guard let nextMidnight = calendar.nextDate(
            after: Date(),
            matching: DateComponents(hour: 0, minute: 0, second: 0),
            matchingPolicy: .nextTime
        ) else { return }

        Timer.scheduledTimer(withTimeInterval: nextMidnight.timeIntervalSinceNow, repeats: false) { [weak self] _ in
            self?.notifiedAppBundles.removeAll()
            self?.dailyAlertSent = false
            self?.scheduleDailyReset()
        }
    }

    func checkAndSendAlerts(appUsages: [AppUsageModel], totalCellularToday: Int64) {
        guard let data = KeychainService.shared.load(forKey: "alertThreshold"),
              let threshold = EncryptionService.shared.decryptCodable(data, as: AlertThreshold.self),
              threshold.notificationsEnabled else { return }

        let totalMB = Double(totalCellularToday) / 1_048_576
        if totalMB > threshold.dailyThresholdMB && !dailyAlertSent {
            post(
                title: "Daily Data Limit Reached",
                body: String(format: "You've used %.0f MB of cellular data today.", totalMB),
                id: "daily-threshold"
            )
            dailyAlertSent = true
        }

        for app in appUsages {
            guard !notifiedAppBundles.contains(app.bundleIdentifier) else { continue }
            let appMB = Double(app.cellularBytes) / 1_048_576
            if appMB > threshold.perAppThresholdMB {
                post(
                    title: "\(app.displayName) Is Using Lots of Data",
                    body: String(format: "%@ used %.0f MB of cellular data.", app.displayName, appMB),
                    id: "app-\(app.bundleIdentifier)"
                )
                notifiedAppBundles.insert(app.bundleIdentifier)
            }
        }
    }

    private func post(title: String, body: String, id: String) {
        let content       = UNMutableNotificationContent()
        content.title     = title
        content.body      = body
        content.sound     = .default
        let trigger       = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
        let request       = UNNotificationRequest(identifier: id, content: content, trigger: trigger)
        UNUserNotificationCenter.current().add(request) { error in
            if let error { print("[DataWatch] Notification error: \(error.localizedDescription)") }
        }
    }
}
