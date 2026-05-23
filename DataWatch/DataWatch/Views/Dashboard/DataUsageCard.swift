import SwiftUI

struct DataUsageCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .foregroundColor(color)
                    .font(.system(size: 14, weight: .medium))
                Text(title)
                    .font(.system(.caption))
                    .foregroundColor(Color.dwWarmWhite.opacity(0.7))
            }
            Text(value)
                .font(.system(.title2, design: .default, weight: .bold))
                .foregroundColor(Color.dwWarmWhite)
                .minimumScaleFactor(0.6)
                .lineLimit(1)
            Text("Today")
                .font(.system(.caption2))
                .foregroundColor(Color.dwWarmWhite.opacity(0.45))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }
}
