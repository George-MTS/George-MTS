import SwiftUI

struct AppUsageRow: View {
    let app: AppUsageModel
    let maxBytes: Int64

    private var barFraction: CGFloat {
        maxBytes > 0 ? min(1, CGFloat(app.totalBytes) / CGFloat(maxBytes)) : 0
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(Color.dwTeal.opacity(0.18))
                        .frame(width: 40, height: 40)
                    Image(systemName: app.iconName)
                        .foregroundColor(Color.dwTeal)
                        .font(.system(size: 16, weight: .medium))
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(app.displayName)
                        .font(.system(.subheadline, design: .default, weight: .medium))
                        .foregroundColor(Color.dwWarmWhite)

                    HStack(spacing: 6) {
                        if app.backgroundPercentage > 0.1 {
                            Label(
                                String(format: "%.0f%% bg", app.backgroundPercentage * 100),
                                systemImage: "moon.fill"
                            )
                            .font(.system(.caption2))
                            .foregroundColor(Color.dwAmber)
                        }
                        Text(app.formattedCellular)
                            .font(.system(.caption2))
                            .foregroundColor(Color.dwTeal)
                        Text("cellular")
                            .font(.system(.caption2))
                            .foregroundColor(Color.dwWarmWhite.opacity(0.4))
                    }
                }

                Spacer()

                Text(app.formattedTotal)
                    .font(.system(.subheadline, design: .default, weight: .semibold))
                    .foregroundColor(Color.dwWarmWhite)
            }

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 2)
                        .fill(Color.dwWarmWhite.opacity(0.1))
                        .frame(height: 4)
                    RoundedRectangle(cornerRadius: 2)
                        .fill(Color.dwTeal)
                        .frame(width: geo.size.width * barFraction, height: 4)
                }
            }
            .frame(height: 4)
        }
        .padding(16)
        .background(Color.dwCardBg)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.08), radius: 8, x: 0, y: 2)
    }
}
