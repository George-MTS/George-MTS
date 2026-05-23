import Foundation
import Network

final class NetworkMonitor: ObservableObject {
    static let shared = NetworkMonitor()

    @Published var isConnected: Bool = false
    @Published var connectionType: ConnectionType = .unknown

    private let monitor = NWPathMonitor()
    private let queue = DispatchQueue(label: "com.datawatch.networkmonitor", qos: .background)

    enum ConnectionType {
        case wifi, cellular, wired, unknown
    }

    private init() {
        startMonitoring()
    }

    private func startMonitoring() {
        monitor.pathUpdateHandler = { [weak self] path in
            DispatchQueue.main.async {
                self?.isConnected = path.status == .satisfied
                self?.updateConnectionType(path)
            }
        }
        monitor.start(queue: queue)
    }

    private func updateConnectionType(_ path: NWPath) {
        if path.usesInterfaceType(.wifi) {
            connectionType = .wifi
        } else if path.usesInterfaceType(.cellular) {
            connectionType = .cellular
        } else if path.usesInterfaceType(.wiredEthernet) {
            connectionType = .wired
        } else {
            connectionType = .unknown
        }
    }

    deinit {
        monitor.cancel()
    }
}
