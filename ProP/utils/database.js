import { Platform } from 'react-native';

let usingSQLite = false;
let db = null;

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

function _webInsertUser({ name, email, phone, password, userType }) {
  return new Promise((resolve, reject) => {
    try {
      const raw = storage.getItem('users') || '[]';
      const arr = JSON.parse(raw);
      // enforce unique email
      if (arr.find(x => x.email === email)) {
        return reject(new Error('User exists'));
      }
      const id = (arr.length > 0 ? arr[arr.length - 1].id + 1 : 1);
      const user = { id, name, email, phone, password, userType };
      arr.push(user);
      storage.setItem('users', JSON.stringify(arr));
      console.log('_webInsertUser:', email, 'stored');
      resolve(user);
    } catch (err) {
      reject(err);
    }
  });
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

  return _webGetUserById(id);
}

export function insertUser({ name, email, phone, password, userType }) {
  if (usingSQLite && db) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO users (name, email, phone, password, userType) VALUES (?, ?, ?, ?, ?);',
          [name, email, phone, password, userType],
          (_, result) => resolve(result),
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  return _webInsertUser({ name, email, phone, password, userType });
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
      });
    }
  } catch (err) {
    // ignore seeding errors for now
    console.log('seed error', err);
  }
}

export default db;
