import Foundation

struct AlertThreshold: Codable {
    var dailyThresholdMB: Double
    var perAppThresholdMB: Double
    var notificationsEnabled: Bool

    static let `default` = AlertThreshold(
        dailyThresholdMB: 500,
        perAppThresholdMB: 50,
        notificationsEnabled: true
    )
}
