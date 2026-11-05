// Tiny IndexedDB wrapper for VanSancharDB (versioned). Stores: pendingMutations, educationDownloads, syncMetadata, cachedOwnReports
const DB = 'VanSancharDB';
const VERSION = 1;
const STORES = ['pendingMutations', 'educationDownloads', 'syncMetadata', 'cachedOwnReports', 'reportDrafts'];

function open(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    if (!('indexedDB' in window)) return rej(new Error('IndexedDB unavailable'));
    const r = indexedDB.open(DB, VERSION);
    r.onupgradeneeded = () => {
      const db = r.result;
      for (const s of STORES) if (!db.objectStoreNames.contains(s)) db.createObjectStore(s, { keyPath: 'key' });
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function tx<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((res, rej) => {
    const t = db.transaction(store, mode);
    const rq = fn(t.objectStore(store));
    t.oncomplete = () => { res(rq.result); db.close(); };
    t.onerror = () => { rej(t.error); db.close(); };
  });
}
export const idbPut = <T extends { key: string }>(store: string, v: T) => tx(store, 'readwrite', (s) => s.put(v));
export const idbGet = <T,>(store: string, key: string) => tx<T | undefined>(store, 'readonly', (s) => s.get(key) as IDBRequest<T | undefined>);
export const idbAll = <T,>(store: string) => tx<T[]>(store, 'readonly', (s) => s.getAll() as IDBRequest<T[]>);
export const idbDel = (store: string, key: string) => tx(store, 'readwrite', (s) => s.delete(key));

export interface QueueItem {
  key: string; mutationId: string; ownerUid: string; operation: 'create'; entityType: 'report' | 'sos';
  localEntityId: string; payload: unknown; createdAt: string; status: 'queued' | 'submitting' | 'failed_retryable' | 'requires_login';
  attempts: number; retryAfter?: number; lastError?: string;
}
