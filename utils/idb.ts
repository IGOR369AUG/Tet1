const IDB_CONFIG = { name: 'PDFMakerDB', version: 1, store: 'files' };

export const idb = {
  open: (): Promise<IDBDatabase> =>
    new Promise((resolve, reject) => {
      const request = indexedDB.open(IDB_CONFIG.name, IDB_CONFIG.version);
      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(IDB_CONFIG.store)) {
          db.createObjectStore(IDB_CONFIG.store);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }),

  put: async (key: string, file: Blob): Promise<void> => {
    const db = await idb.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_CONFIG.store, 'readwrite');
      const store = tx.objectStore(IDB_CONFIG.store);
      const req = store.put(file, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  get: async (key: string): Promise<Blob | null> => {
    const db = await idb.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_CONFIG.store, 'readonly');
      const store = tx.objectStore(IDB_CONFIG.store);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  },

  delete: async (key: string): Promise<void> => {
    const db = await idb.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_CONFIG.store, 'readwrite');
      const store = tx.objectStore(IDB_CONFIG.store);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  clear: async (): Promise<void> => {
    const db = await idb.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_CONFIG.store, 'readwrite');
      const store = tx.objectStore(IDB_CONFIG.store);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
};
