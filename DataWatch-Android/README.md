# DataWatch — Passive Real-Time Data Usage Tracker for Safaricom Kenya

DataWatch is a privacy-first Android application that passively monitors mobile and WiFi data usage for Safaricom users in Kenya. It operates entirely on-device with no external API calls or user accounts.

## Features

- Real-time cellular and WiFi data monitoring via `NetworkStatsManager`
- Per-app breakdown with foreground/background split
- Daily usage gauge with configurable threshold alerts
- Hourly and 7-day bar charts per app (MPAndroidChart)
- Background monitoring via WorkManager (15-minute intervals)
- AES-256 encrypted Room database via Android Keystore
- Boot-persistent worker scheduling
- Push notifications for high usage and daily limit alerts

## Tech Stack

| Component | Library |
|-----------|---------|
| Language | Kotlin |
| Architecture | MVVM |
| Database | Room 2.6.1 + EncryptedSharedPreferences |
| Background | WorkManager 2.9.0 |
| Charts | MPAndroidChart v3.1.0 |
| Navigation | Jetpack Navigation 2.7.6 with Safe Args |
| DI | Manual (no Hilt/Dagger) |

## Build Requirements

- Android Studio Hedgehog (2023.1.1) or newer
- JDK 17
- Android SDK 34
- Gradle 8.0

## Build Instructions

```bash
# Clone/open in Android Studio
cd DataWatch-Android

# Build debug APK
./gradlew assembleDebug

# Run unit tests
./gradlew test

# Output APK location
# app/build/outputs/apk/debug/app-debug.apk
```

## Required Permissions

| Permission | Purpose |
|------------|---------|
| `PACKAGE_USAGE_STATS` | Read per-app network stats (must be granted manually in Settings > Apps > Special access > Usage access) |
| `READ_PHONE_STATE` | Get subscriber ID for cellular stats |
| `ACCESS_NETWORK_STATE` | Check connectivity |
| `POST_NOTIFICATIONS` | Data limit alerts (Android 13+) |
| `RECEIVE_BOOT_COMPLETED` | Restart background worker after reboot |

## First Launch

On first launch, the app checks for Usage Access permission. If not granted, a red banner appears — tap it to open the system settings page. Grant access to DataWatch, then return to the app and pull to refresh.

## Color Palette

| Name | Hex | Use |
|------|-----|-----|
| Primary Background | `#0D1B2A` | Screen backgrounds |
| Card Surface | `#1A2C3D` | Card backgrounds |
| Accent Gold | `#F5A623` | Cellular data, highlights |
| Mint Green | `#2ECC9A` | WiFi data, progress bars |
| Warning Red | `#E74C3C` | Background usage, alerts |
| Primary Text | `#F0F4F8` | Main text |
| Secondary Text | `#8FA3B1` | Labels, captions |

## Privacy

DataWatch is completely offline. No data leaves the device. All usage history is stored in a local Room database. The database file is stored in the app's private data directory.

## Project Structure

```
app/src/main/java/com/datawatch/android/
├── MainActivity.kt
├── DataWatchApplication.kt
├── adapters/AppUsageAdapter.kt
├── database/
│   ├── AppDatabase.kt
│   ├── DataUsageDao.kt
│   ├── AppUsageEntity.kt
│   └── DailyUsageEntity.kt
├── models/
│   ├── AppUsageModel.kt
│   └── DataUsageSummary.kt
├── repository/DataRepository.kt
├── services/
│   ├── NetworkStatsService.kt
│   ├── DataMonitorWorker.kt
│   └── BootReceiver.kt
├── ui/
│   ├── dashboard/
│   │   ├── DashboardFragment.kt
│   │   └── DashboardViewModel.kt
│   ├── apps/
│   │   ├── AppsFragment.kt
│   │   ├── AppsViewModel.kt
│   │   ├── AppDetailFragment.kt
│   │   └── AppDetailViewModel.kt
│   └── settings/
│       ├── SettingsFragment.kt
│       └── SettingsViewModel.kt
└── utils/
    ├── EncryptionHelper.kt
    ├── FormatUtils.kt
    ├── NotificationHelper.kt
    ├── PermissionHelper.kt
    └── PreferenceHelper.kt
```
