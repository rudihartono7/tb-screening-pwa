// IndexedDB utility for offline data storage
export interface DBSchema {
  families: {
    key: string;
    value: any;
  };
  patients: {
    key: string;
    value: any;
  };
  samples: {
    key: string;
    value: any;
  };
  sync_queue: {
    key: string;
    value: {
      id: string;
      action: 'create' | 'update' | 'delete';
      table: string;
      data: any;
      timestamp: number;
    };
  };
}

class IndexedDBManager {
  private dbName = 'tb-screening-db';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('families')) {
          db.createObjectStore('families', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('patients')) {
          db.createObjectStore('patients', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('samples')) {
          db.createObjectStore('samples', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id' });
        }
      };
    });
  }

  async get<T>(storeName: keyof DBSchema, key: string): Promise<T | undefined> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getAll<T>(storeName: keyof DBSchema): Promise<T[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async put<T>(storeName: keyof DBSchema, data: T): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async delete(storeName: keyof DBSchema, key: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(storeName: keyof DBSchema): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Sync queue management
  async addToSyncQueue(action: 'create' | 'update' | 'delete', table: string, data: any): Promise<void> {
    const queueItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action,
      table,
      data,
      timestamp: Date.now(),
    };

    await this.put('sync_queue', queueItem);
  }

  async getSyncQueue(): Promise<any[]> {
    return this.getAll('sync_queue');
  }

  async clearSyncQueue(): Promise<void> {
    return this.clear('sync_queue');
  }

  async removeSyncItem(id: string): Promise<void> {
    return this.delete('sync_queue', id);
  }
}

export const dbManager = new IndexedDBManager();