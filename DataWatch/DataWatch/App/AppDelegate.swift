import UIKit
import BackgroundTasks

class AppDelegate: NSObject, UIApplicationDelegate {

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        BGTaskScheduler.shared.register(
            forTaskWithIdentifier: "com.datawatch.refresh",
            using: nil
        ) { task in
            self.handleBackgroundRefresh(task: task as! BGAppRefreshTask)
        }
        scheduleBackgroundRefresh()
        return true
    }

    private func handleBackgroundRefresh(task: BGAppRefreshTask) {
        DataUsageService.shared.refreshUsageData()
        task.setTaskCompleted(success: true)
        scheduleBackgroundRefresh()
    }

    private func scheduleBackgroundRefresh() {
        let request = BGAppRefreshTaskRequest(identifier: "com.datawatch.refresh")
        request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60)
        try? BGTaskScheduler.shared.submit(request)
    }
}
