import Foundation

struct DataUsageRecord: Codable {
    let id: UUID
    let timestamp: Date
    let bundleIdentifier: String
    let cellularBytes: Int64
    let wifiBytes: Int64
    let backgroundBytes: Int64
    let isBackground: Bool

    init(bundleIdentifier: String, cellularBytes: Int64, wifiBytes: Int64, backgroundBytes: Int64, isBackground: Bool) {
        self.id = UUID()
        self.timestamp = Date()
        self.bundleIdentifier = bundleIdentifier
        self.cellularBytes = cellularBytes
        self.wifiBytes = wifiBytes
        self.backgroundBytes = backgroundBytes
        self.isBackground = isBackground
    }
}

struct HourlyUsage: Identifiable {
    let id = UUID()
    let hour: Int
    let bytes: Int64

    var formattedBytes: String {
        ByteCountFormatter.string(fromByteCount: bytes, countStyle: .binary)
    }
}

struct DailyUsage: Identifiable {
    let id = UUID()
    let date: Date
    let bytes: Int64

    var formattedBytes: String {
        ByteCountFormatter.string(fromByteCount: bytes, countStyle: .binary)
    }

    var dayLabel: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEE"
        return formatter.string(from: date)
    }
}
