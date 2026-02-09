/**
 * Modelo de Usuario para ParkSync
 * Maneja todas las operaciones relacionadas con usuarios en la base de datos
 * 
 * @author ParkSync Team
 * @version 1.0.0
 */

const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

/**
 * Clase que representa el modelo de Usuario
 */
class Usuario {
  /**
   * Busca un usuario por su correo electrónico
   * 
   * @param {string} correo - Correo electrónico del usuario
   * @returns {Promise<Object|null>} Datos del usuario o null si no existe
   */
  static async buscarPorCorreo(correo) {
    try {
      const [filas] = await pool.execute(
        'SELECT * FROM usuarios WHERE correo = ?',
        [correo]
      );
      return filas.length > 0 ? filas[0] : null;
    } catch (error) {
      console.error('Error al buscar usuario por correo:', error);
      throw error;
    }
  }

  /**
   * Busca un usuario por su ID
   * 
   * @param {number} id - ID del usuario
   * @returns {Promise<Object|null>} Datos del usuario o null si no existe
   */
  static async buscarPorId(id) {
    try {
      const [filas] = await pool.execute(
        'SELECT idUsuario, nombre, correo, rol, tipo_documento, numero_documento, activo, fecha_creacion, ultimo_acceso FROM usuarios WHERE idUsuario = ?',
        [id]
      );
      return filas.length > 0 ? filas[0] : null;
    } catch (error) {
      console.error('Error al buscar usuario por ID:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo usuario en la base de datos
   * 
   * @param {Object} datosUsuario - Datos del nuevo usuario
   * @param {string} datosUsuario.nombre - Nombre completo del usuario
   * @param {string} datosUsuario.correo - Correo electrónico
   * @param {string} datosUsuario.contrasena - Contraseña en texto plano (se encriptará)
   * @param {string} datosUsuario.rol - Rol del usuario (empleado, supervisor, administrador)
   * @param {string} datosUsuario.tipoDocumento - Tipo de documento
   * @param {string} datosUsuario.numeroDocumento - Número de documento
   * @returns {Promise<Object>} Usuario creado con su ID
   */
  static async crear(datosUsuario) {
    try {
      const {
        nombre,
        correo,
        contrasena,
        rol = 'empleado',
        tipoDocumento,
        numeroDocumento
      } = datosUsuario;

      // Encriptar la contraseña
      const salt = await bcrypt.genSalt(10);
      const contrasenaEncriptada = await bcrypt.hash(contrasena, salt);

      const [resultado] = await pool.execute(
        'INSERT INTO usuarios (nombre, correo, contrasena, rol, tipo_documento, numero_documento) VALUES (?, ?, ?, ?, ?, ?)',
        [nombre, correo, contrasenaEncriptada, rol, tipoDocumento, numeroDocumento]
      );

      return {
        idUsuario: resultado.insertId,
        nombre,
        correo,
        rol,
        tipo_documento: tipoDocumento,
        numero_documento: numeroDocumento
      };
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  /**
   * Verifica si una contraseña coincide con el hash almacenado
   * 
   * @param {string} contrasenaPlana - Contraseña en texto plano
   * @param {string} contrasenaHash - Hash de contraseña almacenado
   * @returns {Promise<boolean>} True si la contraseña es correcta
   */
  static async verificarContrasena(contrasenaPlana, contrasenaHash) {
    try {
      return await bcrypt.compare(contrasenaPlana, contrasenaHash);
    } catch (error) {
      console.error('Error al verificar contraseña:', error);
      throw error;
    }
  }

  /**
   * Actualiza el último acceso del usuario
   * 
   * @param {number} id - ID del usuario
   * @returns {Promise<boolean>} True si se actualizó correctamente
   */
  static async actualizarUltimoAcceso(id) {
    try {
      await pool.execute(
        'UPDATE usuarios SET ultimo_acceso = NOW() WHERE idUsuario = ?',
        [id]
      );
      return true;
    } catch (error) {
      console.error('Error al actualizar último acceso:', error);
      throw error;
    }
  }

  /**
   * Actualiza la contraseña de un usuario
   * 
  * @param {number} id - ID del usuario
   * @param {string} nuevaContrasena - Nueva contraseña en texto plano
   * @returns {Promise<boolean>} True si se actualizó correctamente
   */
  static async actualizarContrasena(id, nuevaContrasena) {
    try {
      const salt = await bcrypt.genSalt(10);
      const contrasenaEncriptada = await bcrypt.hash(nuevaContrasena, salt);

      await pool.execute(
        'UPDATE usuarios SET contrasena = ? WHERE idUsuario = ?',
        [contrasenaEncriptada, id]
      );
      return true;
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los usuarios (sin contraseñas)
   * 
   * @returns {Promise<Array>} Lista de usuarios
   */
  static async obtenerTodos() {
    try {
      const [filas] = await pool.execute(
        'SELECT idUsuario, nombre, correo, rol, tipo_documento, numero_documento, activo, fecha_creacion, ultimo_acceso FROM usuarios ORDER BY fecha_creacion DESC'
      );
      return filas;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  }

  /**
   * Desactiva un usuario
   * 
   * @param {number} id - ID del usuario
   * @returns {Promise<boolean>} True si se desactivó correctamente
   */
  static async desactivar(id) {
    try {
      await pool.execute(
        'UPDATE usuarios SET activo = 0 WHERE idUsuario = ?',
        [id]
      );
      return true;
    } catch (error) {
      console.error('Error al desactivar usuario:', error);
      throw error;
    }
  }

  /**
   * Actualiza los datos de un usuario
   * 
   * @param {number} id - ID del usuario
   * @param {Object} datos - Datos a actualizar
   * @returns {Promise<boolean>} True si se actualizó correctamente
   */
  static async actualizar(id, datos) {
    try {
      const { nombre, correo, rol, activo, tipo_documento, numero_documento } = datos;
      
      await pool.execute(
        'UPDATE usuarios SET nombre = ?, correo = ?, rol = ?, activo = ?, tipo_documento = ?, numero_documento = ? WHERE idUsuario = ?',
        [nombre, correo, rol, activo, tipo_documento || null, numero_documento || null, id]
      );
      return true;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  /**
   * Elimina un usuario de la base de datos
   * 
   * @param {number} id - ID del usuario
   * @returns {Promise<boolean>} True si se eliminó correctamente
   */
  static async eliminar(id) {
    try {
      await pool.execute(
        'DELETE FROM usuarios WHERE idUsuario = ?',
        [id]
      );
      return true;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }
}

module.exports = Usuario;
