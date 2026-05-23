import Foundation
import CryptoKit
import Security

final class EncryptionService {
    static let shared = EncryptionService()

    private let keyTag = "com.datawatch.encryption.key"
    private var symmetricKey: SymmetricKey?

    private init() {
        symmetricKey = loadOrCreateKey()
    }

    private func loadOrCreateKey() -> SymmetricKey {
        if let existingKeyData = loadKeyFromKeychain() {
            return SymmetricKey(data: existingKeyData)
        }
        let newKey = SymmetricKey(size: .bits256)
        let keyData = newKey.withUnsafeBytes { Data($0) }
        saveKeyToKeychain(keyData)
        return newKey
    }

    private func loadKeyFromKeychain() -> Data? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: keyTag,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        guard status == errSecSuccess else { return nil }
        return result as? Data
    }

    private func saveKeyToKeychain(_ keyData: Data) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: keyTag,
            kSecValueData as String: keyData,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        ]
        SecItemDelete(query as CFDictionary)
        SecItemAdd(query as CFDictionary, nil)
    }

    func encrypt(_ data: Data) -> Data? {
        guard let key = symmetricKey else { return nil }
        do {
            let sealedBox = try AES.GCM.seal(data, using: key)
            return sealedBox.combined
        } catch {
            return nil
        }
    }

    func decrypt(_ data: Data) -> Data? {
        guard let key = symmetricKey else { return nil }
        do {
            let sealedBox = try AES.GCM.SealedBox(combined: data)
            return try AES.GCM.open(sealedBox, using: key)
        } catch {
            return nil
        }
    }

    func encryptCodable<T: Encodable>(_ value: T) -> Data? {
        guard let data = try? JSONEncoder().encode(value) else { return nil }
        return encrypt(data)
    }

    func decryptCodable<T: Decodable>(_ data: Data, as type: T.Type) -> T? {
        guard let decryptedData = decrypt(data) else { return nil }
        return try? JSONDecoder().decode(type, from: decryptedData)
    }
}
