# TestFlight Upload Checklist

Complete every item in order before submitting DataWatch to TestFlight.

## 1. Apple Developer Account Setup

- [ ] Enrol in the **Apple Developer Program** at developer.apple.com ($99/year required for TestFlight distribution).
- [ ] Log in to Xcode with your Apple ID: **Xcode → Settings → Accounts → +**.
- [ ] Create an **App ID** in the Apple Developer portal: Identifiers → App IDs → `com.datawatch.DataWatch`.
- [ ] Enable the **Background Modes** capability on the App ID: fetch + background processing.
- [ ] Create a **Provisioning Profile** (App Store distribution) and download it into Xcode, or use Automatic Signing.

## 2. App Store Connect Setup

- [ ] Create a new app in App Store Connect (appstoreconnect.apple.com).
  - Platform: iOS
  - Bundle ID: `com.datawatch.DataWatch`
  - SKU: `datawatch-ke-001`
- [ ] Fill in at minimum: App Name, Primary Language, Primary Category (Utilities).

## 3. Xcode — Pre-Archive Checks

- [ ] Open `DataWatch.xcodeproj`.
- [ ] Set the scheme to **DataWatch** and destination to **Any iOS Device (arm64)**.
- [ ] In **Signing & Capabilities**, confirm:
  - [ ] Team is set to your developer team.
  - [ ] Bundle Identifier matches `com.datawatch.DataWatch`.
  - [ ] Signing Certificate: Apple Distribution.
  - [ ] Provisioning Profile: App Store profile for the bundle ID.
- [ ] Confirm **Info.plist** contains:
  - [ ] `NSLocalNetworkUsageDescription` (required by App Review for local network access)
  - [ ] `BGTaskSchedulerPermittedIdentifiers` contains `com.datawatch.refresh`
  - [ ] `UIBackgroundModes` contains `fetch` and `processing`
- [ ] Set **Marketing Version** (CFBundleShortVersionString) to `1.0`.
- [ ] Set **Build Number** (CFBundleVersion) to `1` (increment for every upload).
- [ ] Run **⌘U** (all tests pass green).

## 4. Archive

```
Product → Archive   (⌘ + Shift + A alternative: use the menu)
```

- [ ] Wait for the archive to complete (Xcode Organizer opens automatically).
- [ ] Select the archive → **Distribute App**.
- [ ] Choose **App Store Connect** → **Upload**.
- [ ] Enable: **Strip Swift symbols**, **Upload symbols**, **Manage Version and Build Number** (optional).
- [ ] Click **Upload**. Xcode uploads the binary to App Store Connect.

## 5. App Store Connect — TestFlight Configuration

- [ ] Wait for the build to finish processing (5–30 minutes; email notification sent).
- [ ] Go to **TestFlight** tab in App Store Connect.
- [ ] Add **Export Compliance** information (No encryption beyond OS-level = select **No** since we use system CryptoKit, exempt from US export regulations).
- [ ] Add **Internal Testers**: any member of your developer team (up to 100, no review required).
- [ ] For **External Testers**: submit for Beta App Review first (usually 24–48 hours). Required information:
  - [ ] Beta App Description: "DataWatch tracks per-app cellular and Wi-Fi usage locally on your iPhone. Designed for Safaricom users in Kenya."
  - [ ] Feedback Email: your contact email
  - [ ] Privacy Policy URL (required for external testing): create a simple page stating data never leaves the device.

## 6. Invite Testers

- [ ] Internal testers receive an email automatically once the build is active.
- [ ] External testers receive an invite email after Beta App Review approval.
- [ ] Testers install **TestFlight** from the App Store, then tap the invite link.

## 7. App Review Notes (for future full release)

When submitting for App Store Review (not just TestFlight), prepare these notes:

```
DataWatch monitors network activity using Apple's Network framework and 
simulated per-app statistics. It does not use private APIs. All data is 
stored encrypted on-device using CryptoKit. No user accounts, no external 
servers, no data leaves the device. NSLocalNetworkUsageDescription is 
required to satisfy the privacy manifest requirement for local network 
access descriptions, even though no actual LAN connections are initiated.
```

## 8. Version Increment for Future Builds

Each time you upload a new build:
- [ ] Increment **Build Number** (CFBundleVersion) by 1 (e.g. 1 → 2 → 3).
- [ ] Only increment **Marketing Version** when shipping a new user-facing release.

## Known Limitations to Disclose to Testers

- Per-app data breakdown is currently simulated. The app architecture supports a real data source; the mock layer (`MockDataProvider.swift`) will be replaced when a public API or approved Network Extension mechanism becomes available.
- Background refresh requires the device to be on charge or connected to Wi-Fi for iOS to honour the BGAppRefreshTask schedule.
- The bundle remaining percentage (72% shown by default) is a placeholder — integration with Safaricom's USSD balance API is planned for a future release.
