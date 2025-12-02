import { Platform } from 'react-native';

let usingSQLite = false;
let db = null;

// Try to load AsyncStorage for native persistent fallback when sqlite isn't available
let AsyncStorage = null;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (err) {
  AsyncStorage = null;
}
const hasAsyncStorage = !!AsyncStorage;

// Safe localStorage detection
const getStorage = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch (err) {
    // localStorage may be blocked or not available
  }
  
  // Fallback: in-memory store
  return {
    data: {},
    getItem(key) {
      return this.data[key] || null;
    },
    setItem(key, value) {
      this.data[key] = value;
    },
    removeItem(key) {
      delete this.data[key];
    },
    clear() {
      this.data = {};
    },
  };
};

const storage = getStorage();

console.log('=== DATABASE INIT ===');
console.log('Platform.OS:', Platform.OS);

if (Platform.OS !== 'web') {
  try {
    const SQLite = require('expo-sqlite').default || require('expo-sqlite');
    console.log('SQLite loaded successfully');
    db = SQLite.openDatabase('users.db');
    usingSQLite = true;
    console.log('Database opened, usingSQLite:', true);
  } catch (err) {
    console.warn('expo-sqlite not available or error:', err?.message);
    usingSQLite = false;
  }
} else {
  console.log('Web platform detected, using localStorage fallback');
}

// Web fallback using localStorage
function _webInit() {
  if (!storage.getItem('users')) {
    storage.setItem('users', JSON.stringify([]));
  }
  return Promise.resolve(true);
}

function _webGetUserByEmail(email) {
  return new Promise(resolve => {
    const raw = storage.getItem('users') || '[]';
    const arr = JSON.parse(raw);
    const u = arr.find(x => x.email === email) || null;
    console.log('_webGetUserByEmail:', email, 'found:', !!u);
    resolve(u);
  });
}

function _webGetUserById(id) {
  return new Promise(resolve => {
    const raw = storage.getItem('users') || '[]';
    const arr = JSON.parse(raw);
    const u = arr.find(x => x.id === Number(id)) || null;
    resolve(u);
  });
}

function _webInsertUser({ name, email, phone, password, userType, edificio }) {
  return new Promise((resolve, reject) => {
    try {
      const raw = storage.getItem('users') || '[]';
      const arr = JSON.parse(raw);
      // enforce unique email
      if (arr.find(x => x.email === email)) {
        return reject(new Error('User exists'));
      }
      const id = (arr.length > 0 ? arr[arr.length - 1].id + 1 : 1);
      const user = { id, name, email, phone, password, userType, edificio };
      arr.push(user);
      storage.setItem('users', JSON.stringify(arr));
      console.log('_webInsertUser:', email, 'stored');
      resolve(user);
    } catch (err) {
      reject(err);
    }
  });
}

async function _asyncInit() {
  try {
    const raw = await AsyncStorage.getItem('users');
    if (!raw) {
      await AsyncStorage.setItem('users', JSON.stringify([]));
    }
    return true;
  } catch (err) {
    console.warn('_asyncInit error', err);
    return false;
  }
}

async function _asyncGetUserByEmail(email) {
  try {
    const raw = (await AsyncStorage.getItem('users')) || '[]';
    const arr = JSON.parse(raw);
    const u = arr.find(x => x.email === email) || null;
    console.log('_asyncGetUserByEmail:', email, 'found:', !!u);
    return u;
  } catch (err) {
    console.warn('_asyncGetUserByEmail error', err);
    return null;
  }
}

async function _asyncGetUserById(id) {
  try {
    const raw = (await AsyncStorage.getItem('users')) || '[]';
    const arr = JSON.parse(raw);
    const u = arr.find(x => x.id === Number(id)) || null;
    return u;
  } catch (err) {
    console.warn('_asyncGetUserById error', err);
    return null;
  }
}

async function _asyncInsertUser({ name, email, phone, password, userType, edificio }) {
  try {
    const raw = (await AsyncStorage.getItem('users')) || '[]';
    const arr = JSON.parse(raw);
    if (arr.find(x => x.email === email)) {
      throw new Error('User exists');
    }
    const id = (arr.length > 0 ? arr[arr.length - 1].id + 1 : 1);
    const user = { id, name, email, phone, password, userType, edificio };
    arr.push(user);
    await AsyncStorage.setItem('users', JSON.stringify(arr));
    console.log('_asyncInsertUser:', email, 'stored');
    return user;
  } catch (err) {
    throw err;
  }
}

export function initDB() {
  if (usingSQLite && db) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            edificio TEXT,
            password TEXT NOT NULL,
            userType TEXT
          );`,
          [],
          () => resolve(true),
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  // prefer AsyncStorage fallback on native if available
  if (hasAsyncStorage && Platform.OS !== 'web') {
    return _asyncInit();
  }

  // web fallback
  return _webInit();
}

export function getUserByEmail(email) {
  if (usingSQLite && db) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM users WHERE email = ?;',
          [email],
          (_, result) => {
            if (result.rows.length > 0) {
              resolve(result.rows.item(0));
            } else {
              resolve(null);
            }
          },
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  if (hasAsyncStorage && Platform.OS !== 'web') return _asyncGetUserByEmail(email);
  return _webGetUserByEmail(email);
}

export function getUserById(id) {
  if (usingSQLite && db) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM users WHERE id = ?;',
          [id],
          (_, result) => {
            if (result.rows.length > 0) {
              resolve(result.rows.item(0));
            } else {
              resolve(null);
            }
          },
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  if (hasAsyncStorage && Platform.OS !== 'web') return _asyncGetUserById(id);
  return _webGetUserById(id);
}

export function insertUser({ name, email, phone, password, userType, edificio }) {
  if (usingSQLite && db) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO users (name, email, phone, edificio, password, userType) VALUES (?, ?, ?, ?, ?, ?);',
          [name, email, phone, edificio, password, userType],
          (_, result) => resolve(result),
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  if (hasAsyncStorage && Platform.OS !== 'web') return _asyncInsertUser({ name, email, phone, password, userType, edificio });
  return _webInsertUser({ name, email, phone, password, userType, edificio });
}

export async function seedInitialUser() {
  try {
    const existing = await getUserByEmail('124050107@upq.edu.mx');
    if (!existing) {
      await insertUser({
        name: 'Monse',
        email: '124050107@upq.edu.mx',
        phone: '4423828724',
        password: '12345678',
        userType: 'Tutorado',
        edificio: 'D206',
      });
    }
  } catch (err) {
    // ignore seeding errors for now
    console.log('seed error', err);
  }
}

export default db;
