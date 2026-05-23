import Foundation

struct AppUsageModel: Identifiable, Codable, Equatable {
    let id: UUID
    var bundleIdentifier: String
    var displayName: String
    var iconName: String
    var cellularBytesReceived: Int64
    var cellularBytesSent: Int64
    var wifiBytesReceived: Int64
    var wifiBytesSent: Int64
    var backgroundBytesTotal: Int64
    var lastUpdated: Date
    var isSystemApp: Bool

    var totalBytes: Int64 {
        cellularBytesReceived + cellularBytesSent + wifiBytesReceived + wifiBytesSent
    }

    var cellularBytes: Int64 {
        cellularBytesReceived + cellularBytesSent
    }

    var wifiBytes: Int64 {
        wifiBytesReceived + wifiBytesSent
    }

    var formattedTotal: String {
        ByteCountFormatter.string(fromByteCount: totalBytes, countStyle: .binary)
    }

    var formattedCellular: String {
        ByteCountFormatter.string(fromByteCount: cellularBytes, countStyle: .binary)
    }

    var formattedWifi: String {
        ByteCountFormatter.string(fromByteCount: wifiBytes, countStyle: .binary)
    }

    var backgroundPercentage: Double {
        guard totalBytes > 0 else { return 0 }
        return Double(backgroundBytesTotal) / Double(totalBytes)
    }

    static func == (lhs: AppUsageModel, rhs: AppUsageModel) -> Bool {
        lhs.id == rhs.id
    }
}
