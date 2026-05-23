import SwiftUI

struct WeeklyChartView: View {
    let data: [DailyUsage]

    private var maxBytes: Int64 { data.map(\.bytes).max() ?? 1 }

    var body: some View {
        GeometryReader { outer in
            HStack(alignment: .bottom, spacing: 8) {
                ForEach(data) { point in
                    VStack(spacing: 6) {
                        let ratio = maxBytes > 0 ? CGFloat(point.bytes) / CGFloat(maxBytes) : 0
                        Spacer(minLength: 0)
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.dwTeal.opacity(0.85))
                            .frame(height: max(4, (outer.size.height - 24) * ratio))
                        Text(point.dayLabel)
                            .font(.system(.caption2, design: .default, weight: .medium))
                            .foregroundColor(Color.dwWarmWhite.opacity(0.6))
                    }
                    .frame(maxWidth: .infinity)
                }
            }
        }
    }
}
