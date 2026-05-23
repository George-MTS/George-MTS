import SwiftUI

struct ContentView: View {
    @StateObject private var dashboardVM = DashboardViewModel()
    @StateObject private var settingsVM  = SettingsViewModel()

    init() {
        configureTabBar()
        configureNavBar()
        NotificationService.shared.requestPermission()
    }

    private func configureTabBar() {
        let appearance = UITabBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor(Color.dwNavy)
        UITabBar.appearance().standardAppearance   = appearance
        UITabBar.appearance().scrollEdgeAppearance = appearance
    }

    private func configureNavBar() {
        let appearance = UINavigationBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor(Color.dwNavy)
        appearance.titleTextAttributes         = [.foregroundColor: UIColor(Color.dwWarmWhite)]
        appearance.largeTitleTextAttributes    = [.foregroundColor: UIColor(Color.dwWarmWhite)]
        UINavigationBar.appearance().standardAppearance   = appearance
        UINavigationBar.appearance().scrollEdgeAppearance = appearance
    }

    var body: some View {
        TabView {
            DashboardView(viewModel: dashboardVM)
                .tabItem { Label("Dashboard", systemImage: "chart.bar.fill") }

            AppsListView()
                .tabItem { Label("Apps", systemImage: "square.grid.2x2.fill") }

            SettingsView(viewModel: settingsVM)
                .tabItem { Label("Settings", systemImage: "gearshape.fill") }
        }
        .tint(Color.dwTeal)
    }
}
