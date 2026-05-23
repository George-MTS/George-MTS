# DataWatch — Real-Time Data Usage Tracker for Safaricom Users

DataWatch is a native iOS app that passively monitors cellular and Wi-Fi data usage per app in real time. It is built for Safaricom users in Kenya who want to understand exactly where their mobile data goes — including background refresh activity — without manual input.

## Features

- **Dashboard** — Total cellular and Wi-Fi usage today, top data-consuming apps ranked by usage, background vs. foreground split per app, and a circular bundle-remaining indicator.
- **App Breakdown** — Tapping any app shows an hourly usage chart for today and a cumulative 7-day chart, plus a foreground/background split.
- **Alerts** — Local push notifications when any app exceeds 50 MB in a session or when daily cellular usage exceeds your configured threshold.
- **Privacy Shield** — Persistent indicator confirming all data is encrypted locally with AES-256 and never leaves the device.
- **Settings** — Set your daily data threshold, toggle notifications, and reset all stored data.

## Architecture

| Layer | Technology |
|---|---|
| Language | Swift 5.9+ |
| UI | SwiftUI (MVVM) |
| Persistence | CoreData + AES-256 via CryptoKit |
| Key storage | iOS Keychain |
| Network monitoring | Network framework (NWPathMonitor) |
| Notifications | UserNotifications (local only) |
| Background refresh | BackgroundTasks (BGAppRefreshTask) |

> **Simulator note:** iOS does not expose per-app data usage to third-party apps via a public API. DataWatch uses a realistic mock data layer (`MockDataProvider.swift`) that simulates per-app usage so the app looks and feels complete on the simulator. On a real device the architecture is wired to accept live data from `CTCellularUsageMonitor` or a future Network Extension — swap out `MockDataProvider` with a real data source without changing any other layer.

## Requirements

- Xcode 15 or later
- iOS 16.0 deployment target
- An Apple Developer account (free or paid) for running on a physical device

## Opening in Xcode

```bash
git clone <repo-url>
open DataWatch/DataWatch.xcodeproj
```

Xcode will resolve everything automatically. No package dependencies, no CocoaPods, no SPM packages.

## Running on the Simulator

1. Open `DataWatch.xcodeproj` in Xcode.
2. Select any iPhone simulator (iOS 16+) from the scheme picker.
3. Press **⌘R** (Run).

The app launches directly to the Dashboard showing simulated per-app usage data.

## Running on a Physical iPhone

1. Connect your iPhone via USB.
2. In Xcode, select your device from the scheme picker.
3. Go to **Signing & Capabilities** → select your Team (Apple ID).
4. Change the bundle identifier if needed: `com.datawatch.DataWatch` → `com.<yourname>.DataWatch`.
5. Press **⌘R**. Trust the developer profile on the device under **Settings → General → VPN & Device Management**.

## Running Tests

```
⌘U   — Run all unit tests
```

Tests cover:
- `EncryptionServiceTests` — AES-GCM round-trip, codable encryption, invalid data handling
- `DataUsageServiceTests` — Refresh produces sorted non-empty results, hourly/daily structure
- `ViewModelTests` — Dashboard VM binding, App Detail VM loading

## Project Structure

```
DataWatch/
├── DataWatch.xcodeproj/
└── DataWatch/
    ├── App/               DataWatchApp.swift, AppDelegate.swift
    ├── Models/            AppUsageModel, DataUsageRecord, AlertThreshold
    ├── ViewModels/        DashboardViewModel, AppDetailViewModel, SettingsViewModel
    ├── Views/
    │   ├── Shared/        ContentView, PrivacyShieldView
    │   ├── Dashboard/     DashboardView, DataUsageCard, AppUsageRow, BundleProgressView
    │   ├── AppDetail/     AppDetailView, HourlyChartView, WeeklyChartView
    │   ├── Apps/          AppsListView
    │   └── Settings/      SettingsView
    ├── Services/          NetworkMonitor, DataUsageService, MockDataProvider,
    │                      NotificationService, EncryptionService
    ├── Storage/           CoreDataStack, KeychainService
    ├── Extensions/        Color+Theme, View+Extensions
    └── Resources/         Assets.xcassets, DataWatchModel.xcdatamodeld, Info.plist
DataWatchTests/            Unit tests
```

## Security

- All usage data stored in CoreData is encrypted with AES-256-GCM before writing.
- The symmetric key is generated once and stored in the iOS Keychain with `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`.
- The entitlements file explicitly sets `com.apple.security.network.client = false`, preventing outbound network access.
- No third-party SDKs, no analytics, no crash reporters, no external API calls.

## Replacing Mock Data with Real Data

When Apple provides a public API for per-app network usage (or if you implement a Network Extension profile), replace `MockDataProvider.generateMockAppUsages()` inside `DataUsageService.refreshUsageData()` with your real data source. All downstream ViewModels, Views, and persistence layers remain unchanged.
