import { GateLog, User, Asset, Vehicle } from '../types';

// IndexedDB database name and version
const DB_NAME = 'GatePassDB';
const DB_VERSION = 1;

// Object store names
const STORES = {
  GATE_LOGS: 'gateLogs',
  USERS: 'users',
  ASSETS: 'assets',
  VEHICLES: 'vehicles',
  PENDING_ACTIONS: 'pendingActions'
};

class OfflineStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains(STORES.GATE_LOGS)) {
          const gateLogsStore = db.createObjectStore(STORES.GATE_LOGS, { keyPath: 'id' });
          gateLogsStore.createIndex('timestamp', 'timestamp');
          gateLogsStore.createIndex('guardId', 'guardId');
          gateLogsStore.createIndex('type', 'type');
        }

        if (!db.objectStoreNames.contains(STORES.USERS)) {
          const usersStore = db.createObjectStore(STORES.USERS, { keyPath: 'id' });
          usersStore.createIndex('email', 'email', { unique: true });
          usersStore.createIndex('role', 'role');
        }

        if (!db.objectStoreNames.contains(STORES.ASSETS)) {
          const assetsStore = db.createObjectStore(STORES.ASSETS, { keyPath: 'id' });
          assetsStore.createIndex('userId', 'userId');
          assetsStore.createIndex('qrCode', 'qrCode', { unique: true });
        }

        if (!db.objectStoreNames.contains(STORES.VEHICLES)) {
          const vehiclesStore = db.createObjectStore(STORES.VEHICLES, { keyPath: 'id' });
          vehiclesStore.createIndex('userId', 'userId');
          vehiclesStore.createIndex('plateNumber', 'plateNumber');
        }

        if (!db.objectStoreNames.contains(STORES.PENDING_ACTIONS)) {
          db.createObjectStore(STORES.PENDING_ACTIONS, { keyPath: 'id' });
        }
      };
    });
  }

  // Gate Logs operations
  async saveGateLog(log: GateLog): Promise<void> {
    if (!this.db) await this.init();
    return this.performTransaction(STORES.GATE_LOGS, 'readwrite', (store) => {
      store.put(log);
    });
  }

  async getGateLogs(limit = 100): Promise<GateLog[]> {
    if (!this.db) await this.init();
    return this.performTransaction(STORES.GATE_LOGS, 'readonly', (store) => {
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev');
      const results: GateLog[] = [];
      let count = 0;

      return new Promise((resolve) => {
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor && count < limit) {
            results.push(cursor.value);
            count++;
            cursor.continue();
          } else {
            resolve(results);
          }
        };
      });
    });
  }

  async getGateLogsByGuard(guardId: string): Promise<GateLog[]> {
    if (!this.db) await this.init();
    return this.performTransaction(STORES.GATE_LOGS, 'readonly', (store) => {
      const index = store.index('guardId');
      return this.getAllFromIndex(index, guardId);
    });
  }

  // Users operations
  async saveUser(user: User): Promise<void> {
    if (!this.db) await this.init();
    return this.performTransaction(STORES.USERS, 'readwrite', (store) => {
      store.put(user);
    });
  }

  async getUser(id: string): Promise<User | null> {
    if (!this.db) await this.init();
    return this.performTransaction(STORES.USERS, 'readonly', (store) => {
      return new Promise((resolve) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
      });
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!this.db) await this.init();
    return this.performTransaction(STORES.USERS, 'readonly', (store) => {
      const index = store.index('email');
      return new Promise((resolve) => {
        const request = index.get(email);
        request.onsuccess = () => resolve(request.result || null);
      });
    });
  }

  // Assets operations
  async saveAsset(asset: Asset): Promise<void> {
    if (!this.db) await this.init();
    return this.performTransaction(STORES.ASSETS, 'readwrite', (store) => {
      store.put(asset);
    });
  }

  async getAssetsByUser(userId: string): Promise<Asset[]> {
    if (!this.db) await this.init();
    return this.performTransaction(STORES.ASSETS, 'readonly', (store) => {
      const index = store.index('userId');
      return this.getAllFromIndex(index, userId);
    });
  }

  async getAssetByQR(qrCode: string): Promise<Asset | null> {
    if (!this.db) await this.init();
    return this.performTransaction(STORES.ASSETS, 'readonly', (store) => {
      const index = store.index('qrCode');
      return new Promise((resolve) => {
        const request = index.get(qrCode);
        request.onsuccess = () => resolve(request.result || null);
      });
    });
  }

  // Vehicles operations
  async saveVehicle(vehicle: Vehicle): Promise<void> {
    if (!this.db) await this.init();
    return this.performTransaction(STORES.VEHICLES, 'readwrite', (store) => {
      store.put(vehicle);
    });
  }

  async getVehiclesByUser(userId: string): Promise<Vehicle[]> {
    if (!this.db) await this.init();
    return this.performTransaction(STORES.VEHICLES, 'readonly', (store) => {
      const index = store.index('userId');
      return this.getAllFromIndex(index, userId);
    });
  }

  async getVehicleByPlate(plateNumber: string): Promise<Vehicle | null> {
    if (!this.db) await this.init();
    return this.performTransaction(STORES.VEHICLES, 'readonly', (store) => {
      const index = store.index('plateNumber');
      return new Promise((resolve) => {
        const request = index.get(plateNumber);
        request.onsuccess = () => resolve(request.result || null);
      });
    });
  }

  // Pending actions for offline sync
  async savePendingAction(action: any): Promise<void> {
    if (!this.db) await this.init();
    const actionWithId = {
      ...action,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    return this.performTransaction(STORES.PENDING_ACTIONS, 'readwrite', (store) => {
      store.put(actionWithId);
    });
  }

  async getPendingActions(): Promise<any[]> {
    if (!this.db) await this.init();
    return this.performTransaction(STORES.PENDING_ACTIONS, 'readonly', (store) => {
      return new Promise((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
      });
    });
  }

  async removePendingAction(id: string): Promise<void> {
    if (!this.db) await this.init();
    return this.performTransaction(STORES.PENDING_ACTIONS, 'readwrite', (store) => {
      store.delete(id);
    });
  }

  // Helper methods
  private async performTransaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => Promise<T> | T
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);

      transaction.onerror = () => reject(transaction.error);
      
      const result = operation(store);
      
      if (result instanceof Promise) {
        result.then(resolve).catch(reject);
      } else {
        transaction.oncomplete = () => resolve(result);
      }
    });
  }

  private getAllFromIndex(index: IDBIndex, key: string): Promise<any[]> {
    return new Promise((resolve) => {
      const request = index.getAll(key);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // Clear all data (for testing/reset purposes)
  async clearAllData(): Promise<void> {
    if (!this.db) await this.init();
    
    const storeNames = Object.values(STORES);
    const transaction = this.db!.transaction(storeNames, 'readwrite');
    
    storeNames.forEach(storeName => {
      transaction.objectStore(storeName).clear();
    });

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

// Singleton instance
export const offlineStorage = new OfflineStorage();

export default OfflineStorage;