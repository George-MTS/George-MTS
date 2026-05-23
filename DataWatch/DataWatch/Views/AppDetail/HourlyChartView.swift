import SwiftUI

struct HourlyChartView: View {
    let data: [HourlyUsage]

    private var maxBytes: Int64 { data.map(\.bytes).max() ?? 1 }

    var body: some View {
        GeometryReader { outer in
            HStack(alignment: .bottom, spacing: 2) {
                ForEach(data) { point in
                    VStack(spacing: 4) {
                        let ratio = maxBytes > 0 ? CGFloat(point.bytes) / CGFloat(maxBytes) : 0
                        Spacer(minLength: 0)
                        RoundedRectangle(cornerRadius: 3)
                            .fill(Color.dwTeal)
                            .frame(height: max(2, (outer.size.height - 20) * ratio))
                        if point.hour % 6 == 0 {
                            Text("\(point.hour)h")
                                .font(.system(size: 8))
                                .foregroundColor(Color.dwWarmWhite.opacity(0.4))
                        } else {
                            Text(" ").font(.system(size: 8))
                        }
                    }
                }
            }
        }
    }
}
