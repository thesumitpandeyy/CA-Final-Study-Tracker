import { LocalUser } from '../firebase';
import { Chapter, SPOMExam, StudyLog, Subject } from '../types';

const DB_NAME = 'CATrackerDB';
const DB_VERSION = 2;

export interface UserMetadata {
  uid: string;
  completionDates: Record<Subject, string>;
  currentView: string;
  caFinalExamDate: string;
  updatedAt: string;
}

export const initializeDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'uid' });
        userStore.createIndex('username', 'username', { unique: true });
        userStore.createIndex('email', 'email', { unique: true });
      }

      if (!db.objectStoreNames.contains('chapters')) {
        const chapterStore = db.createObjectStore('chapters', { keyPath: 'id' });
        chapterStore.createIndex('userId', 'userId', { unique: false });
      }

      if (!db.objectStoreNames.contains('spom')) {
        const spomStore = db.createObjectStore('spom', { keyPath: 'id' });
        spomStore.createIndex('userId', 'userId', { unique: false });
      }

      if (!db.objectStoreNames.contains('logs')) {
        const logStore = db.createObjectStore('logs', { keyPath: 'id' });
        logStore.createIndex('userId', 'userId', { unique: false });
      }

      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'uid' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const clearUserRecords = (tx: IDBTransaction, storeName: string, userId: string): Promise<void> => {
  return new Promise((resolve) => {
    const store = tx.objectStore(storeName);
    const index = store.index('userId');
    const request = index.openKeyCursor(IDBKeyRange.only(userId));
    request.onsuccess = (event: any) => {
      const cursor = event.target.result;
      if (cursor) {
        store.delete(cursor.primaryKey);
        cursor.continue();
      } else {
        resolve();
      }
    };
  });
};

export const updateUserData = async (
  userId: string, 
  data: { 
    chapters: Chapter[], 
    spomExams: SPOMExam[], 
    logs: StudyLog[], 
    completionDates: Record<Subject, string>,
    currentView: string,
    caFinalExamDate: string
  }
): Promise<void> => {
  const db = await initializeDB();
  return new Promise(async (resolve, reject) => {
    const tx = db.transaction(['chapters', 'spom', 'logs', 'metadata'], 'readwrite');
    
    // Use try-catch inside the promise to handle async clearing
    try {
      // 1. Update Metadata (Simple put, key is UID)
      tx.objectStore('metadata').put({
        uid: userId,
        completionDates: data.completionDates,
        currentView: data.currentView,
        caFinalExamDate: data.caFinalExamDate,
        updatedAt: new Date().toISOString()
      });

      // 2. Clear then re-add collections to handle deletions correctly
      await clearUserRecords(tx, 'chapters', userId);
      const chapterStore = tx.objectStore('chapters');
      data.chapters.forEach(c => chapterStore.put({ ...c, userId }));

      await clearUserRecords(tx, 'spom', userId);
      const spomStore = tx.objectStore('spom');
      data.spomExams.forEach(s => spomStore.put({ ...s, userId }));

      await clearUserRecords(tx, 'logs', userId);
      const logStore = tx.objectStore('logs');
      data.logs.forEach(l => logStore.put({ ...l, userId }));

      tx.oncomplete = () => resolve();
    } catch (err) {
      reject(err);
    }
    
    tx.onerror = () => reject(tx.error);
  });
};

export const loadUserFullData = async (userId: string) => {
  const db = await initializeDB();
  return new Promise<any>((resolve, reject) => {
    const results: any = { chapters: [], spomExams: [], logs: [], metadata: null };
    const tx = db.transaction(['chapters', 'spom', 'logs', 'metadata'], 'readonly');

    tx.objectStore('metadata').get(userId).onsuccess = (e: any) => {
      results.metadata = e.target.result;
    };

    tx.objectStore('chapters').index('userId').getAll(userId).onsuccess = (e: any) => {
      results.chapters = e.target.result;
    };

    tx.objectStore('spom').index('userId').getAll(userId).onsuccess = (e: any) => {
      results.spomExams = e.target.result;
    };

    tx.objectStore('logs').index('userId').getAll(userId).onsuccess = (e: any) => {
      results.logs = e.target.result;
    };

    tx.oncomplete = () => resolve(results);
    tx.onerror = () => reject(tx.error);
  });
};

export const getAllUsers = async (): Promise<LocalUser[]> => {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('users', 'readonly');
    const store = transaction.objectStore('users');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const addUser = async (user: LocalUser): Promise<void> => {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('users', 'readwrite');
    const store = transaction.objectStore('users');
    const request = store.put(user);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getUserByIdentifier = async (identifier: string): Promise<LocalUser | null> => {
  const users = await getAllUsers();
  const lowerId = identifier.toLowerCase();
  return users.find(u => u.username.toLowerCase() === lowerId || u.email.toLowerCase() === lowerId) || null;
};
