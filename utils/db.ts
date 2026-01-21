
import { LocalUser } from '../firebase';
import { Chapter, SPOMExam, StudyLog, Subject } from '../types';

const DB_NAME = 'CATrackerDB';
const DB_VERSION = 2;

export interface UserData {
  uid: string;
  completionDates: Record<Subject, string>;
  currentView: string;
}

export const initializeDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      
      // Users Store
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'uid' });
        userStore.createIndex('username', 'username', { unique: true });
        userStore.createIndex('email', 'email', { unique: true });
      }

      // Chapters Store
      if (!db.objectStoreNames.contains('chapters')) {
        const chapterStore = db.createObjectStore('chapters', { keyPath: 'id' });
        chapterStore.createIndex('userId', 'userId', { unique: false });
      }

      // SPOM Store
      if (!db.objectStoreNames.contains('spom')) {
        const spomStore = db.createObjectStore('spom', { keyPath: 'id' });
        spomStore.createIndex('userId', 'userId', { unique: false });
      }

      // Logs Store
      if (!db.objectStoreNames.contains('logs')) {
        const logStore = db.createObjectStore('logs', { keyPath: 'id' });
        logStore.createIndex('userId', 'userId', { unique: false });
      }

      // User Metadata (Completion dates, settings)
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'uid' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
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

export const updateUserData = async (
  userId: string, 
  data: { 
    chapters: Chapter[], 
    spomExams: SPOMExam[], 
    logs: StudyLog[], 
    completionDates: Record<Subject, string>,
    currentView: string
  }
): Promise<void> => {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['chapters', 'spom', 'logs', 'metadata'], 'readwrite');
    
    // 1. Update Metadata
    tx.objectStore('metadata').put({
      uid: userId,
      completionDates: data.completionDates,
      currentView: data.currentView,
      updatedAt: new Date().toISOString()
    });

    // 2. Update Chapters
    const chapterStore = tx.objectStore('chapters');
    data.chapters.forEach(c => chapterStore.put({ ...c, userId }));

    // 3. Update SPOM
    const spomStore = tx.objectStore('spom');
    data.spomExams.forEach(s => spomStore.put({ ...s, userId }));

    // 4. Update Logs
    const logStore = tx.objectStore('logs');
    data.logs.forEach(l => logStore.put({ ...l, userId }));

    tx.oncomplete = () => resolve();
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

export const clearDB = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
