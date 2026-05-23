import SwiftUI

extension View {
    func cardStyle() -> some View {
        self
            .padding(16)
            .background(Color.dwCardBg)
            .cornerRadius(16)
            .shadow(color: .black.opacity(0.08), radius: 8, x: 0, y: 2)
    }
}
