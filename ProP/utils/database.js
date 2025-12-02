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

function _webInsertUser({ name, email, phone, password, userType, edificio, grupo, matricula }) {
  return new Promise((resolve, reject) => {
    try {
      const raw = storage.getItem('users') || '[]';
      const arr = JSON.parse(raw);
      // enforce unique email
      if (arr.find(x => x.email === email)) {
        return reject(new Error('User exists'));
      }
      const id = (arr.length > 0 ? arr[arr.length - 1].id + 1 : 1);
      const user = { id, name, email, phone, password, userType, edificio, grupo: grupo || null, matricula: matricula || null };
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

async function _asyncInsertUser({ name, email, phone, password, userType, edificio, grupo, matricula }) {
  try {
    const raw = (await AsyncStorage.getItem('users')) || '[]';
    const arr = JSON.parse(raw);
    if (arr.find(x => x.email === email)) {
      throw new Error('User exists');
    }
    const id = (arr.length > 0 ? arr[arr.length - 1].id + 1 : 1);
    const user = { id, name, email, phone, password, userType, edificio, grupo: grupo || null, matricula: matricula || null };
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
            grupo TEXT,
            matricula TEXT,
            password TEXT NOT NULL,
            userType TEXT
          );`,
          [],
          () => {
            // Create sessions table
            tx.executeSql(
              `CREATE TABLE IF NOT EXISTS sesiones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuarioId INTEGER NOT NULL,
                tutorId INTEGER,
                materia TEXT NOT NULL,
                fecha TEXT NOT NULL,
                hora TEXT NOT NULL,
                estado TEXT DEFAULT 'pendiente',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuarioId) REFERENCES users(id)
              );`,
              [],
              () => resolve(true),
              (_, err) => {
                reject(err);
                return false;
              }
            );
          },
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

export function insertUser({ name, email, phone, password, userType, edificio, grupo, matricula }) {
  if (usingSQLite && db) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO users (name, email, phone, edificio, grupo, matricula, password, userType) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
          [name, email, phone, edificio || null, grupo || null, matricula || null, password, userType],
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

function _webUpdateUser(id, changes) {
  return new Promise((resolve, reject) => {
    try {
      const raw = storage.getItem('users') || '[]';
      const arr = JSON.parse(raw);
      const idx = arr.findIndex(x => Number(x.id) === Number(id));
      if (idx === -1) return reject(new Error('User not found'));
      arr[idx] = Object.assign({}, arr[idx], changes, { id: arr[idx].id });
      storage.setItem('users', JSON.stringify(arr));
      resolve(arr[idx]);
    } catch (err) {
      reject(err);
    }
  });
}

async function _asyncUpdateUser(id, changes) {
  try {
    const raw = (await AsyncStorage.getItem('users')) || '[]';
    const arr = JSON.parse(raw);
    const idx = arr.findIndex(x => Number(x.id) === Number(id));
    if (idx === -1) throw new Error('User not found');
    arr[idx] = Object.assign({}, arr[idx], changes, { id: arr[idx].id });
    await AsyncStorage.setItem('users', JSON.stringify(arr));
    return arr[idx];
  } catch (err) {
    throw err;
  }
}

export function updateUser(id, changes) {
  if (usingSQLite && db) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE users SET name = ?, email = ?, phone = ?, edificio = ?, grupo = ?, matricula = ?, userType = ? WHERE id = ?;',
          [changes.name || null, changes.email || null, changes.phone || null, changes.edificio || null, changes.grupo || null, changes.matricula || null, changes.userType || null, id],
          async (_, result) => {
            try {
              const updated = await getUserById(id);
              resolve(updated);
            } catch (e) {
              resolve(true);
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

  if (hasAsyncStorage && Platform.OS !== 'web') return _asyncUpdateUser(id, changes);
  return _webUpdateUser(id, changes);
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

// ========== SESIONES FUNCTIONS ==========

function _webInitSesiones() {
  if (!storage.getItem('sesiones')) {
    storage.setItem('sesiones', JSON.stringify([]));
  }
  return Promise.resolve(true);
}

async function _asyncInitSesiones() {
  try {
    const raw = await AsyncStorage.getItem('sesiones');
    if (!raw) {
      await AsyncStorage.setItem('sesiones', JSON.stringify([]));
    }
    return true;
  } catch (err) {
    console.warn('_asyncInitSesiones error', err);
    return false;
  }
}

function _webInsertSesion({ usuarioId, tutorId, materia, fecha, hora, estado }) {
  return new Promise((resolve, reject) => {
    try {
      const raw = storage.getItem('sesiones') || '[]';
      const arr = JSON.parse(raw);
      const id = (arr.length > 0 ? arr[arr.length - 1].id + 1 : 1);
      const sesion = {
        id,
        usuarioId: Number(usuarioId),
        tutorId: tutorId ? Number(tutorId) : null,
        materia,
        fecha,
        hora,
        estado: estado || 'pendiente',
        createdAt: new Date().toISOString(),
      };
      arr.push(sesion);
      storage.setItem('sesiones', JSON.stringify(arr));
      console.log('_webInsertSesion: stored');
      resolve(sesion);
    } catch (err) {
      reject(err);
    }
  });
}

async function _asyncInsertSesion({ usuarioId, tutorId, materia, fecha, hora, estado }) {
  try {
    const raw = (await AsyncStorage.getItem('sesiones')) || '[]';
    const arr = JSON.parse(raw);
    const id = (arr.length > 0 ? arr[arr.length - 1].id + 1 : 1);
    const sesion = {
      id,
      usuarioId: Number(usuarioId),
      tutorId: tutorId ? Number(tutorId) : null,
      materia,
      fecha,
      hora,
      estado: estado || 'pendiente',
      createdAt: new Date().toISOString(),
    };
    arr.push(sesion);
    await AsyncStorage.setItem('sesiones', JSON.stringify(arr));
    console.log('_asyncInsertSesion: stored');
    return sesion;
  } catch (err) {
    throw err;
  }
}

export function initSesionesTable() {
  if (usingSQLite && db) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS sesiones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuarioId INTEGER NOT NULL,
            tutorId INTEGER,
            materia TEXT NOT NULL,
            fecha TEXT NOT NULL,
            hora TEXT NOT NULL,
            estado TEXT DEFAULT 'pendiente',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
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

  if (hasAsyncStorage && Platform.OS !== 'web') {
    return _asyncInitSesiones();
  }

  return _webInitSesiones();
}

export function insertSesion({ usuarioId, tutorId, materia, fecha, hora, estado }) {
  if (usingSQLite && db) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO sesiones (usuarioId, tutorId, materia, fecha, hora, estado) VALUES (?, ?, ?, ?, ?, ?);',
          [usuarioId, tutorId || null, materia, fecha, hora, estado || 'pendiente'],
          (_, result) => {
            // Get the inserted row
            tx.executeSql(
              'SELECT * FROM sesiones WHERE id = ?;',
              [result.insertId],
              (_, result2) => {
                if (result2.rows.length > 0) {
                  resolve(result2.rows.item(0));
                } else {
                  resolve(result);
                }
              },
              (_, err) => {
                resolve(result);
              }
            );
          },
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  if (hasAsyncStorage && Platform.OS !== 'web') {
    return _asyncInsertSesion({ usuarioId, tutorId, materia, fecha, hora, estado });
  }
  return _webInsertSesion({ usuarioId, tutorId, materia, fecha, hora, estado });
}

export function getSesionesByUsuario(usuarioId) {
  if (usingSQLite && db) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM sesiones WHERE usuarioId = ? ORDER BY fecha ASC, hora ASC;',
          [usuarioId],
          (_, result) => {
            const sesiones = [];
            for (let i = 0; i < result.rows.length; i++) {
              sesiones.push(result.rows.item(i));
            }
            resolve(sesiones);
          },
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  // AsyncStorage/Web fallback
  return new Promise(async (resolve, reject) => {
    try {
      const storage = hasAsyncStorage && Platform.OS !== 'web' ? AsyncStorage : getStorage();
      const raw = Platform.OS === 'web' 
        ? storage.getItem('sesiones') || '[]'
        : (await storage.getItem('sesiones')) || '[]';
      const arr = JSON.parse(raw);
      const sesiones = arr.filter(s => Number(s.usuarioId) === Number(usuarioId));
      resolve(sesiones.sort((a, b) => {
        const dateA = new Date(a.fecha);
        const dateB = new Date(b.fecha);
        return dateA - dateB;
      }));
    } catch (err) {
      reject(err);
    }
  });
}

export function getSesionById(sesionId) {
  if (usingSQLite && db) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM sesiones WHERE id = ?;',
          [sesionId],
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

  // AsyncStorage/Web fallback
  return new Promise(async (resolve, reject) => {
    try {
      const storage = hasAsyncStorage && Platform.OS !== 'web' ? AsyncStorage : getStorage();
      const raw = Platform.OS === 'web' 
        ? storage.getItem('sesiones') || '[]'
        : (await storage.getItem('sesiones')) || '[]';
      const arr = JSON.parse(raw);
      const sesion = arr.find(s => Number(s.id) === Number(sesionId));
      resolve(sesion || null);
    } catch (err) {
      reject(err);
    }
  });
}

function _webUpdateSesion(sesionId, changes) {
  return new Promise((resolve, reject) => {
    try {
      const raw = storage.getItem('sesiones') || '[]';
      const arr = JSON.parse(raw);
      const idx = arr.findIndex(s => Number(s.id) === Number(sesionId));
      if (idx === -1) return reject(new Error('Sesión no encontrada'));
      arr[idx] = { ...arr[idx], ...changes, id: arr[idx].id };
      storage.setItem('sesiones', JSON.stringify(arr));
      resolve(arr[idx]);
    } catch (err) {
      reject(err);
    }
  });
}

async function _asyncUpdateSesion(sesionId, changes) {
  try {
    const raw = (await AsyncStorage.getItem('sesiones')) || '[]';
    const arr = JSON.parse(raw);
    const idx = arr.findIndex(s => Number(s.id) === Number(sesionId));
    if (idx === -1) throw new Error('Sesión no encontrada');
    arr[idx] = { ...arr[idx], ...changes, id: arr[idx].id };
    await AsyncStorage.setItem('sesiones', JSON.stringify(arr));
    return arr[idx];
  } catch (err) {
    throw err;
  }
}

export function updateSesion(sesionId, changes) {
  if (usingSQLite && db) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE sesiones SET tutorId = ?, materia = ?, fecha = ?, hora = ?, estado = ? WHERE id = ?;',
          [
            changes.tutorId || null,
            changes.materia,
            changes.fecha,
            changes.hora,
            changes.estado || 'pendiente',
            sesionId
          ],
          async (_, result) => {
            try {
              const updated = await getSesionById(sesionId);
              resolve(updated);
            } catch (e) {
              resolve(true);
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

  if (hasAsyncStorage && Platform.OS !== 'web') {
    return _asyncUpdateSesion(sesionId, changes);
  }
  return _webUpdateSesion(sesionId, changes);
}

function _webDeleteSesion(sesionId) {
  return new Promise((resolve, reject) => {
    try {
      const raw = storage.getItem('sesiones') || '[]';
      const arr = JSON.parse(raw);
      const filtered = arr.filter(s => Number(s.id) !== Number(sesionId));
      storage.setItem('sesiones', JSON.stringify(filtered));
      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
}

async function _asyncDeleteSesion(sesionId) {
  try {
    const raw = (await AsyncStorage.getItem('sesiones')) || '[]';
    const arr = JSON.parse(raw);
    const filtered = arr.filter(s => Number(s.id) !== Number(sesionId));
    await AsyncStorage.setItem('sesiones', JSON.stringify(filtered));
    return true;
  } catch (err) {
    throw err;
  }
}

export function deleteSesion(sesionId) {
  if (usingSQLite && db) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM sesiones WHERE id = ?;',
          [sesionId],
          (_, result) => resolve(true),
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  if (hasAsyncStorage && Platform.OS !== 'web') {
    return _asyncDeleteSesion(sesionId);
  }
  return _webDeleteSesion(sesionId);
}

// ========== MAESTROS Y MATERIAS FUNCTIONS ==========

function _webInitMaestroMaterias() {
  if (!storage.getItem('maestro_materias')) {
    storage.setItem('maestro_materias', JSON.stringify([]));
  }
  return Promise.resolve(true);
}

async function _asyncInitMaestroMaterias() {
  try {
    const raw = await AsyncStorage.getItem('maestro_materias');
    if (!raw) {
      await AsyncStorage.setItem('maestro_materias', JSON.stringify([]));
    }
    return true;
  } catch (err) {
    console.warn('_asyncInitMaestroMaterias error', err);
    return false;
  }
}

function _webInsertMaestroMateria({ maestroId, materia }) {
  return new Promise((resolve, reject) => {
    try {
      const raw = storage.getItem('maestro_materias') || '[]';
      const arr = JSON.parse(raw);
      // Check if already exists
      if (arr.find(m => m.maestroId === Number(maestroId) && m.materia === materia)) {
        return resolve(null); // Already exists
      }
      const id = (arr.length > 0 ? arr[arr.length - 1].id + 1 : 1);
      const item = {
        id,
        maestroId: Number(maestroId),
        materia,
      };
      arr.push(item);
      storage.setItem('maestro_materias', JSON.stringify(arr));
      resolve(item);
    } catch (err) {
      reject(err);
    }
  });
}

async function _asyncInsertMaestroMateria({ maestroId, materia }) {
  try {
    const raw = (await AsyncStorage.getItem('maestro_materias')) || '[]';
    const arr = JSON.parse(raw);
    if (arr.find(m => m.maestroId === Number(maestroId) && m.materia === materia)) {
      return null; // Already exists
    }
    const id = (arr.length > 0 ? arr[arr.length - 1].id + 1 : 1);
    const item = {
      id,
      maestroId: Number(maestroId),
      materia,
    };
    arr.push(item);
    await AsyncStorage.setItem('maestro_materias', JSON.stringify(arr));
    return item;
  } catch (err) {
    throw err;
  }
}

export function initMaestroMateriasTable() {
  if (usingSQLite && db) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS maestro_materias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            maestroId INTEGER NOT NULL,
            materia TEXT NOT NULL,
            FOREIGN KEY (maestroId) REFERENCES users(id)
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

  if (hasAsyncStorage && Platform.OS !== 'web') {
    return _asyncInitMaestroMaterias();
  }

  return _webInitMaestroMaterias();
}

export function insertMaestroMateria({ maestroId, materia }) {
  if (usingSQLite && db) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT OR IGNORE INTO maestro_materias (maestroId, materia) VALUES (?, ?);',
          [maestroId, materia],
          (_, result) => resolve(result),
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  if (hasAsyncStorage && Platform.OS !== 'web') {
    return _asyncInsertMaestroMateria({ maestroId, materia });
  }
  return _webInsertMaestroMateria({ maestroId, materia });
}

export function getMaestros() {
  if (usingSQLite && db) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          "SELECT * FROM users WHERE userType IN ('Tutor', 'Maestro', 'Profesor');",
          [],
          (_, result) => {
            const maestros = [];
            for (let i = 0; i < result.rows.length; i++) {
              maestros.push(result.rows.item(i));
            }
            resolve(maestros);
          },
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  // AsyncStorage/Web fallback
  return new Promise(async (resolve, reject) => {
    try {
      const storage = hasAsyncStorage && Platform.OS !== 'web' ? AsyncStorage : getStorage();
      const raw = Platform.OS === 'web' 
        ? storage.getItem('users') || '[]'
        : (await storage.getItem('users')) || '[]';
      const arr = JSON.parse(raw);
      const maestros = arr.filter(u => 
        u.userType === 'Tutor' || u.userType === 'Maestro' || u.userType === 'Profesor'
      );
      resolve(maestros);
    } catch (err) {
      reject(err);
    }
  });
}

export function getMateriasByMaestro(maestroId) {
  if (usingSQLite && db) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT materia FROM maestro_materias WHERE maestroId = ?;',
          [maestroId],
          (_, result) => {
            const materias = [];
            for (let i = 0; i < result.rows.length; i++) {
              materias.push(result.rows.item(i).materia);
            }
            resolve(materias);
          },
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  // AsyncStorage/Web fallback
  return new Promise(async (resolve, reject) => {
    try {
      const storage = hasAsyncStorage && Platform.OS !== 'web' ? AsyncStorage : getStorage();
      const raw = Platform.OS === 'web' 
        ? storage.getItem('maestro_materias') || '[]'
        : (await storage.getItem('maestro_materias')) || '[]';
      const arr = JSON.parse(raw);
      const materias = arr
        .filter(m => Number(m.maestroId) === Number(maestroId))
        .map(m => m.materia);
      resolve(materias);
    } catch (err) {
      reject(err);
    }
  });
}

export function getMaestrosByMateria(materia) {
  if (usingSQLite && db) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT u.* FROM users u 
           INNER JOIN maestro_materias mm ON u.id = mm.maestroId 
           WHERE mm.materia = ? AND u.userType IN ('Tutor', 'Maestro', 'Profesor');`,
          [materia],
          (_, result) => {
            const maestros = [];
            for (let i = 0; i < result.rows.length; i++) {
              maestros.push(result.rows.item(i));
            }
            resolve(maestros);
          },
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  // AsyncStorage/Web fallback
  return new Promise(async (resolve, reject) => {
    try {
      const userStorage = hasAsyncStorage && Platform.OS !== 'web' ? AsyncStorage : getStorage();
      const materiaStorage = hasAsyncStorage && Platform.OS !== 'web' ? AsyncStorage : getStorage();
      
      const usersRaw = Platform.OS === 'web' 
        ? userStorage.getItem('users') || '[]'
        : (await userStorage.getItem('users')) || '[]';
      const materiasRaw = Platform.OS === 'web' 
        ? materiaStorage.getItem('maestro_materias') || '[]'
        : (await materiaStorage.getItem('maestro_materias')) || '[]';
      
      const users = JSON.parse(usersRaw);
      const materias = JSON.parse(materiasRaw);
      
      const maestroIds = materias
        .filter(m => m.materia === materia)
        .map(m => Number(m.maestroId));
      
      const maestros = users.filter(u => 
        maestroIds.includes(Number(u.id)) && 
        (u.userType === 'Tutor' || u.userType === 'Maestro' || u.userType === 'Profesor')
      );
      
      resolve(maestros);
    } catch (err) {
      reject(err);
    }
  });
}

export function getAllMaterias() {
  if (usingSQLite && db) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT DISTINCT materia FROM maestro_materias ORDER BY materia;',
          [],
          (_, result) => {
            const materias = [];
            for (let i = 0; i < result.rows.length; i++) {
              materias.push(result.rows.item(i).materia);
            }
            resolve(materias);
          },
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  // AsyncStorage/Web fallback
  return new Promise(async (resolve, reject) => {
    try {
      const storage = hasAsyncStorage && Platform.OS !== 'web' ? AsyncStorage : getStorage();
      const raw = Platform.OS === 'web' 
        ? storage.getItem('maestro_materias') || '[]'
        : (await storage.getItem('maestro_materias')) || '[]';
      const arr = JSON.parse(raw);
      const materias = [...new Set(arr.map(m => m.materia))].sort();
      resolve(materias);
    } catch (err) {
      reject(err);
    }
  });
}

export async function seedMaestrosAndMaterias() {
  try {
    // Crear algunos maestros de ejemplo
    const maestros = [
      {
        name: 'Luis Barrón Durán',
        email: 'luis.barron@upq.edu.mx',
        phone: '4421234567',
        password: '12345678',
        userType: 'Tutor',
        edificio: 'D206',
      },
      {
        name: 'María González',
        email: 'maria.gonzalez@upq.edu.mx',
        phone: '4422345678',
        password: '12345678',
        userType: 'Tutor',
        edificio: 'D205',
      },
      {
        name: 'Carlos Ramírez',
        email: 'carlos.ramirez@upq.edu.mx',
        phone: '4423456789',
        password: '12345678',
        userType: 'Tutor',
        edificio: 'D207',
      },
    ];

    const materiasPorMaestro = {
      'luis.barron@upq.edu.mx': ['Programacion', 'Estructuras de Datos', 'Algoritmos'],
      'maria.gonzalez@upq.edu.mx': ['Cálculo Integral', 'Álgebra Lineal', 'Matemáticas Discretas'],
      'carlos.ramirez@upq.edu.mx': ['Programacion', 'Base de Datos', 'Ingeniería de Software'],
    };

    for (const maestro of maestros) {
      const existing = await getUserByEmail(maestro.email);
      let maestroId;
      
      if (!existing) {
        const newUser = await insertUser(maestro);
        // insertUser puede devolver result (SQLite) o user object (AsyncStorage/Web)
        if (newUser.insertId) {
          maestroId = newUser.insertId;
        } else if (newUser.id) {
          maestroId = newUser.id;
        } else {
          // Si no tiene ID, buscar el usuario recién creado
          const created = await getUserByEmail(maestro.email);
          if (created) maestroId = created.id;
        }
      } else {
        maestroId = existing.id;
      }

      // Agregar materias solo si tenemos un maestroId válido
      if (maestroId) {
        const materias = materiasPorMaestro[maestro.email] || [];
        for (const materia of materias) {
          await insertMaestroMateria({ maestroId, materia });
        }
      }
    }
  } catch (err) {
    console.log('seed maestros error', err);
  }
}

export default db;
