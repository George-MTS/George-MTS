import Darwin
import Foundation

struct NetworkSnapshot {
    let wifi: Int64
    let cellular: Int64

    static let zero = NetworkSnapshot(wifi: 0, cellular: 0)
}

enum NetworkBytesReader {
    // Returns cumulative interface bytes since last boot via getifaddrs.
    // en* = WiFi/Ethernet, pdp_ip* = Cellular on iOS.
    static func current() -> NetworkSnapshot {
        var ifaddrsPtr: UnsafeMutablePointer<ifaddrs>?
        guard getifaddrs(&ifaddrsPtr) == 0, let head = ifaddrsPtr else {
            return .zero
        }
        defer { freeifaddrs(ifaddrsPtr) }

        var wifi: Int64 = 0
        var cellular: Int64 = 0
        var ptr: UnsafeMutablePointer<ifaddrs>? = head

        while let iface = ptr {
            defer { ptr = iface.pointee.ifa_next }
            guard iface.pointee.ifa_addr?.pointee.sa_family == UInt8(AF_LINK),
                  let rawData = iface.pointee.ifa_data else { continue }

            let stats = rawData.assumingMemoryBound(to: if_data.self).pointee
            let total = Int64(stats.ifi_ibytes) + Int64(stats.ifi_obytes)
            let name  = String(cString: iface.pointee.ifa_name)

            if name.hasPrefix("en") {
                wifi += total
            } else if name.hasPrefix("pdp_ip") {
                cellular += total
            }
        }
        return NetworkSnapshot(wifi: wifi, cellular: cellular)
    }
}
