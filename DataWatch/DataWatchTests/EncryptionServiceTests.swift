import XCTest
@testable import DataWatch

final class EncryptionServiceTests: XCTestCase {

    func testEncryptDecryptRoundTrip() {
        let service = EncryptionService.shared
        let original = "Safaricom DataWatch test payload 🇰🇪"
        guard let data = original.data(using: .utf8) else {
            XCTFail("Failed to encode test string")
            return
        }
        guard let encrypted = service.encrypt(data) else {
            XCTFail("Encryption returned nil")
            return
        }
        XCTAssertNotEqual(data, encrypted, "Encrypted data should differ from plaintext")
        guard let decrypted = service.decrypt(encrypted) else {
            XCTFail("Decryption returned nil")
            return
        }
        let result = String(data: decrypted, encoding: .utf8)
        XCTAssertEqual(result, original, "Decrypted value should match original")
    }

    func testEncryptCodableRoundTrip() {
        let service = EncryptionService.shared
        let threshold = AlertThreshold(dailyThresholdMB: 250, perAppThresholdMB: 75, notificationsEnabled: true)
        guard let encrypted = service.encryptCodable(threshold) else {
            XCTFail("encryptCodable returned nil")
            return
        }
        guard let decoded = service.decryptCodable(encrypted, as: AlertThreshold.self) else {
            XCTFail("decryptCodable returned nil")
            return
        }
        XCTAssertEqual(decoded.dailyThresholdMB, threshold.dailyThresholdMB)
        XCTAssertEqual(decoded.perAppThresholdMB, threshold.perAppThresholdMB)
        XCTAssertEqual(decoded.notificationsEnabled, threshold.notificationsEnabled)
    }

    func testDifferentPlaintextsProduceDifferentCiphertexts() {
        let service = EncryptionService.shared
        let a = service.encrypt(Data("hello".utf8))
        let b = service.encrypt(Data("world".utf8))
        XCTAssertNotNil(a)
        XCTAssertNotNil(b)
        XCTAssertNotEqual(a, b)
    }

    func testDecryptGarbageReturnsNil() {
        let service = EncryptionService.shared
        let garbage = Data(repeating: 0xFF, count: 64)
        let result = service.decrypt(garbage)
        XCTAssertNil(result, "Decrypting invalid data should return nil")
    }
}
