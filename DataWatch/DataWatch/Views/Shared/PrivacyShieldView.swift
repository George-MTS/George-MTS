import SwiftUI

struct PrivacyShieldView: View {
    let lastRefreshDate: Date

    private var refreshLabel: String {
        let f = RelativeDateTimeFormatter()
        f.unitsStyle = .abbreviated
        return f.localizedString(for: lastRefreshDate, relativeTo: Date())
    }

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "lock.shield.fill")
                .foregroundColor(Color.dwAmber)
                .font(.system(size: 20))

            VStack(alignment: .leading, spacing: 2) {
                Text("Your data never leaves your phone")
                    .font(.system(.caption, design: .default, weight: .medium))
                    .foregroundColor(Color.dwWarmWhite)

                Text("AES-256 encrypted · Updated \(refreshLabel)")
                    .font(.system(.caption2))
                    .foregroundColor(Color.dwWarmWhite.opacity(0.55))
            }

            Spacer()

            Image(systemName: "checkmark.circle.fill")
                .foregroundColor(Color.dwAmber)
                .font(.system(size: 14))
        }
        .padding(12)
        .background(Color.dwAmber.opacity(0.10))
        .cornerRadius(10)
        .padding(.horizontal, 20)
    }
}
