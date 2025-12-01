import SQLite from 'react-native-sqlite-storage';
import { Usuario } from '../models/usuario';

const DB_NAME = 'tutoriadb.db';

class DatabaseService {
  constructor() {
    this.db = null;
  }

  async openDatabase() {
    try {
      this.db = await SQLite.openDatabase({
        name: DB_NAME,
        location: 'default',
      });
      console.log('Base de datos abierta');
      await this.createTablesIfNeeded();
    } catch (error) {
      console.error('Error al abrir la base de datos:', error);
    }
  }

  async createTablesIfNeeded() {
    try {
      await this.db.executeSql(
        `CREATE TABLE IF NOT EXISTS usuario (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          apellidos TEXT NOT NULL,
          rol TEXT,
          grupo TEXT,
          matricula TEXT,
          correo TEXT,
          celular TEXT,
          edificio TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );`
      );
      console.log('Tabla usuario creada correctamente');
    } catch (error) {
      console.error('Error al crear tabla:', error);
    }
  }

  async insertarUsuario(usuario) {
    try {
      const result = await this.db.executeSql(
        `INSERT INTO usuario (nombre, apellidos, rol, grupo, matricula, correo, celular, edificio)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          usuario.nombre,
          usuario.apellidos,
          usuario.rol,
          usuario.grupo,
          usuario.matricula,
          usuario.correo,
          usuario.celular,
          usuario.edificio,
        ]
      );
      return result[0].insertId;
    } catch (error) {
      console.error('Error al insertar usuario:', error);
      throw error;
    }
  }

  async actualizarUsuario(usuario) {
    try {
      await this.db.executeSql(
        `UPDATE usuario 
         SET nombre = ?, apellidos = ?, rol = ?, grupo = ?, matricula = ?, 
             correo = ?, celular = ?, edificio = ?, updatedAt = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          usuario.nombre,
          usuario.apellidos,
          usuario.rol,
          usuario.grupo,
          usuario.matricula,
          usuario.correo,
          usuario.celular,
          usuario.edificio,
          usuario.id,
        ]
      );
      console.log('Usuario actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  async obtenerUsuario(id) {
    try {
      const result = await this.db.executeSql(
        'SELECT * FROM usuario WHERE id = ?',
        [id]
      );
      if (result[0].rows.length > 0) {
        const row = result[0].rows.item(0);
        return new Usuario(
          row.id,
          row.nombre,
          row.apellidos,
          row.rol,
          row.grupo,
          row.matricula,
          row.correo,
          row.celular,
          row.edificio
        );
      }
      return null;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw error;
    }
  }

  async obtenerTodosLosUsuarios() {
    try {
      const result = await this.db.executeSql('SELECT * FROM usuario');
      const usuarios = [];
      for (let i = 0; i < result[0].rows.length; i++) {
        const row = result[0].rows.item(i);
        usuarios.push(
          new Usuario(
            row.id,
            row.nombre,
            row.apellidos,
            row.rol,
            row.grupo,
            row.matricula,
            row.correo,
            row.celular,
            row.edificio
          )
        );
      }
      return usuarios;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  }

  async eliminarUsuario(id) {
    try {
      await this.db.executeSql('DELETE FROM usuario WHERE id = ?', [id]);
      console.log('Usuario eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }

  async closeDatabase() {
    if (this.db) {
      await this.db.close();
      console.log('Base de datos cerrada');
    }
  }
}

export default new DatabaseService();
