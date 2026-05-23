import Foundation

struct MockDataProvider {

    private static let appCatalog: [(name: String, icon: String, bundle: String)] = [
        ("YouTube",   "play.rectangle.fill",    "com.google.ios.youtube"),
        ("WhatsApp",  "message.fill",            "net.whatsapp.WhatsApp"),
        ("Instagram", "camera.fill",             "com.burbn.instagram"),
        ("Safari",    "safari.fill",             "com.apple.mobilesafari"),
        ("TikTok",    "video.fill",              "com.zhiliaoapp.musically"),
        ("Spotify",   "music.note",              "com.spotify.client"),
        ("Gmail",     "envelope.fill",           "com.google.Gmail"),
        ("Maps",      "map.fill",                "com.apple.Maps"),
        ("X",         "bird.fill",               "com.atebits.Tweetie2"),
        ("Netflix",   "tv.fill",                 "com.netflix.Netflix"),
        ("Telegram",  "paperplane.fill",         "ph.telegra.Telegraph"),
        ("Facebook",  "person.2.fill",           "com.facebook.Facebook"),
        ("Chrome",    "globe",                   "com.google.chrome.ios"),
        ("Zoom",      "video.circle.fill",       "us.zoom.videomeetings"),
        ("Snapchat",  "camera.circle.fill",      "com.toyopagroup.picaboo")
    ]

    static func generateMockAppUsages() -> [AppUsageModel] {
        appCatalog.enumerated().map { index, app in
            let rankFactor = Double(appCatalog.count - index) / Double(appCatalog.count)
            let totalMB    = rankFactor * Double.random(in: 80...180)

            let cellularRatio    = Double.random(in: 0.3...0.7)
            let backgroundRatio  = Double.random(in: 0.1...0.4)

            let totalBytes       = Int64(totalMB * 1_048_576)
            let cellularBytes    = Int64(Double(totalBytes) * cellularRatio)
            let wifiBytes        = totalBytes - cellularBytes
            let backgroundBytes  = Int64(Double(totalBytes) * backgroundRatio)

            return AppUsageModel(
                id:                    UUID(),
                bundleIdentifier:      app.bundle,
                displayName:           app.name,
                iconName:              app.icon,
                cellularBytesReceived: Int64(Double(cellularBytes) * 0.7),
                cellularBytesSent:     Int64(Double(cellularBytes) * 0.3),
                wifiBytesReceived:     Int64(Double(wifiBytes) * 0.8),
                wifiBytesSent:         Int64(Double(wifiBytes) * 0.2),
                backgroundBytesTotal:  backgroundBytes,
                lastUpdated:           Date(),
                isSystemApp:           false
            )
        }
    }

    static func generateHourlyUsage(for bundleIdentifier: String) -> [HourlyUsage] {
        let currentHour = Calendar.current.component(.hour, from: Date())
        return (0...currentHour).map { hour in
            let active = (hour >= 8 && hour <= 22)
            let mb     = active ? Double.random(in: 1...20) : Double.random(in: 0...2)
            return HourlyUsage(hour: hour, bytes: Int64(mb * 1_048_576))
        }
    }

    static func generateDailyUsage(for bundleIdentifier: String) -> [DailyUsage] {
        let calendar = Calendar.current
        return (0..<7).reversed().map { daysAgo in
            let date  = calendar.date(byAdding: .day, value: -daysAgo, to: Date())!
            let bytes = Int64(Double.random(in: 50...300) * 1_048_576)
            return DailyUsage(date: date, bytes: bytes)
        }
    }
}
