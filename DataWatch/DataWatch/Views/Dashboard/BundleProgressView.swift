import SwiftUI

struct BundleProgressView: View {
    let remainingPercentage: Double

    private var ringColor: Color {
        switch remainingPercentage {
        case 0.5...: return Color.dwAmber    // mint green — healthy level
        case 0.2..<0.5: return Color.dwTeal  // amber gold — getting low
        default: return Color.dwWarning       // red — critical
        }
    }

    var body: some View {
        HStack(spacing: 20) {
            ZStack {
                Circle()
                    .stroke(Color.dwWarmWhite.opacity(0.1), lineWidth: 8)
                    .frame(width: 76, height: 76)
                Circle()
                    .trim(from: 0, to: remainingPercentage)
                    .stroke(ringColor, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                    .frame(width: 76, height: 76)
                    .rotationEffect(.degrees(-90))
                VStack(spacing: 0) {
                    Text("\(Int(remainingPercentage * 100))%")
                        .font(.system(.subheadline, design: .default, weight: .bold))
                        .foregroundColor(Color.dwWarmWhite)
                    Text("left")
                        .font(.system(.caption2))
                        .foregroundColor(Color.dwWarmWhite.opacity(0.5))
                }
            }

            VStack(alignment: .leading, spacing: 4) {
                Text("Data Bundle")
                    .font(.system(.headline, design: .default, weight: .semibold))
                    .foregroundColor(Color.dwWarmWhite)
                Text("Estimated remaining")
                    .font(.system(.caption))
                    .foregroundColor(Color.dwWarmWhite.opacity(0.6))
                Text(String(format: "%.0f%% of your monthly bundle", remainingPercentage * 100))
                    .font(.system(.caption))
                    .foregroundColor(ringColor)
            }

            Spacer()
        }
        .padding(20)
        .background(Color.dwCardBg)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.08), radius: 8, x: 0, y: 2)
        .padding(.horizontal, 20)
    }
}
