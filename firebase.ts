
import * as db from './utils/db';

const CURRENT_USER_KEY = 'ca_tracker_user';

export interface LocalUser {
  uid: string;
  username: string;
  email: string;
  displayName: string;
  photoURL: string;
  password?: string;
}

const DEFAULT_USERS: LocalUser[] = [
  {
    uid: 'default-user-1',
    username: 'aspirant',
    email: 'aspirant@cafinal.com',
    displayName: 'Aspirant CA',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CA_Aspirant',
    password: '123456'
  }
];

// Seed default users on every initialization to simulate "cloud" presence
const seedDefaultUsers = async () => {
  for (const user of DEFAULT_USERS) {
    const existing = await db.getUserByIdentifier(user.username);
    if (!existing) {
      await db.addUser(user);
    }
  }
};

// Start seeding immediately
seedDefaultUsers();

export const auth = {
  get currentUser(): LocalUser | null {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
  }
};

export const registerUser = async (data: { username: string, email: string, password: string }): Promise<LocalUser> => {
  const existing = await db.getUserByIdentifier(data.username);
  if (existing) throw new Error('Username already taken.');
  
  const existingEmail = await db.getUserByIdentifier(data.email);
  if (existingEmail) throw new Error('Email already registered.');

  const newUser: LocalUser = {
    uid: Date.now().toString(),
    username: data.username,
    email: data.email,
    displayName: data.username,
    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
    password: data.password 
  };

  await db.addUser(newUser);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  return newUser;
};

export const loginUser = async (identifier: string, password: string): Promise<LocalUser> => {
  const user = await db.getUserByIdentifier(identifier);
  
  if (!user || user.password !== password) {
    throw new Error('Invalid username/email or password.');
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
};

export const signOut = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const onAuthStateChanged = (authObj: any, callback: (user: any) => void) => {
  const user = auth.currentUser;
  callback(user);
  return () => {};
};

export { db as firestore };
