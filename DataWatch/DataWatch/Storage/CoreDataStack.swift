import CoreData
import Foundation

final class CoreDataStack {
    static let shared = CoreDataStack()

    lazy var persistentContainer: NSPersistentContainer = {
        let container = NSPersistentContainer(name: "DataWatchModel")
        container.loadPersistentStores { _, error in
            if let error {
                print("[DataWatch] CoreData load error: \(error.localizedDescription)")
            }
        }
        container.viewContext.automaticallyMergesChangesFromParent = true
        return container
    }()

    var context: NSManagedObjectContext { persistentContainer.viewContext }

    private init() {}

    private func saveContext(_ ctx: NSManagedObjectContext) {
        guard ctx.hasChanges else { return }
        do {
            try ctx.save()
        } catch {
            print("[DataWatch] CoreData save error: \(error.localizedDescription)")
        }
    }

    func saveUsageSnapshot(_ apps: [AppUsageModel]) {
        let bg = persistentContainer.newBackgroundContext()
        bg.perform {
            let fetch = NSFetchRequest<NSManagedObject>(entityName: "UsageSnapshot")
            fetch.predicate = NSPredicate(format: "date >= %@", Calendar.current.startOfDay(for: Date()) as NSDate)
            if let old = try? bg.fetch(fetch) { old.forEach { bg.delete($0) } }

            guard let entity = NSEntityDescription.entity(forEntityName: "UsageSnapshot", in: bg) else { return }
            let snapshot = NSManagedObject(entity: entity, insertInto: bg)
            snapshot.setValue(Date(), forKey: "date")
            if let encrypted = EncryptionService.shared.encryptCodable(apps) {
                snapshot.setValue(encrypted, forKey: "encryptedData")
            }
            self.saveContext(bg)
        }
    }

    func loadLatestSnapshot() -> [AppUsageModel] {
        let fetch = NSFetchRequest<NSManagedObject>(entityName: "UsageSnapshot")
        fetch.sortDescriptors = [NSSortDescriptor(key: "date", ascending: false)]
        fetch.fetchLimit = 1
        guard let result = try? context.fetch(fetch),
              let obj    = result.first,
              let data   = obj.value(forKey: "encryptedData") as? Data else { return [] }
        return EncryptionService.shared.decryptCodable(data, as: [AppUsageModel].self) ?? []
    }

    func clearAllData() {
        let fetch = NSFetchRequest<NSFetchRequestResult>(entityName: "UsageSnapshot")
        let del   = NSBatchDeleteRequest(fetchRequest: fetch)
        _ = try? context.execute(del)
        saveContext(context)
    }
}
