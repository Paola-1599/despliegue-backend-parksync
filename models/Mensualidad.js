/**
 * Modelo de Mensualidad
 * Maneja las operaciones CRUD para membresías mensuales/anuales
 */

const { pool } = require('../config/db');

class Mensualidad {
  /**
   * Crear nueva mensualidad
   */
  static async crear(datos) {
    const {
      nombreCompleto,
      tipoDocumento,
      numeroDocumento,
      telefono,
      correo,
      placa,
      tipoVehiculo,
      marca,
      color,
      es24_7,
      fechaInicio,
      fechaVencimiento,
      valorMensual,
      estado,
      usuarioId
    } = datos;

    const [resultado] = await pool.query(
      `INSERT INTO mensualidades (
        nombre_completo, tipo_documento, numero_documento, telefono, correo,
        placa, tipo_vehiculo, marca, color, es_24_7,
        fecha_inicio, fecha_vencimiento, valor_mensual, estado, usuario_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombreCompleto,
        tipoDocumento,
        numeroDocumento,
        telefono,
        correo,
        placa.toUpperCase(),
        tipoVehiculo,
        marca,
        color,
        es24_7 ? 1 : 0,
        fechaInicio,
        fechaVencimiento,
        valorMensual,
        estado,
        usuarioId
      ]
    );

    return this.buscarPorId(resultado.insertId);
  }

  /**
   * Buscar mensualidad por ID
   */
  static async buscarPorId(id) {
    const [mensualidades] = await pool.query(
      'SELECT * FROM mensualidades WHERE id = ?',
      [id]
    );

    return mensualidades[0] || null;
  }

  /**
   * Obtener todas las mensualidades de un usuario
   */
  static async obtenerPorUsuario(usuarioId) {
    const [mensualidades] = await pool.query(
      'SELECT * FROM mensualidades WHERE usuario_id = ? ORDER BY fecha_vencimiento DESC',
      [usuarioId]
    );

    return mensualidades;
  }

  /**
   * Obtener todas las mensualidades
   */
  static async obtenerTodas() {
    const [mensualidades] = await pool.query(
      'SELECT * FROM mensualidades ORDER BY fecha_vencimiento DESC'
    );

    return mensualidades;
  }

  /**
   * Actualizar mensualidad
   */
  static async actualizar(id, datos) {
    const {
      nombreCompleto,
      tipoDocumento,
      numeroDocumento,
      telefono,
      correo,
      placa,
      tipoVehiculo,
      marca,
      color,
      es24_7,
      fechaInicio,
      fechaVencimiento,
      valorMensual,
      estado
    } = datos;

    await pool.query(
      `UPDATE mensualidades SET
        nombre_completo = ?, tipo_documento = ?, numero_documento = ?,
        telefono = ?, correo = ?, placa = ?, tipo_vehiculo = ?,
        marca = ?, color = ?, es_24_7 = ?,
        fecha_inicio = ?, fecha_vencimiento = ?, valor_mensual = ?,
        estado = ?, fecha_actualizacion = NOW()
       WHERE id = ?`,
      [
        nombreCompleto,
        tipoDocumento,
        numeroDocumento,
        telefono,
        correo,
        placa.toUpperCase(),
        tipoVehiculo,
        marca,
        color,
        es24_7 ? 1 : 0,
        fechaInicio,
        fechaVencimiento,
        valorMensual,
        estado,
        id
      ]
    );

    return this.buscarPorId(id);
  }

  /**
   * Eliminar mensualidad
   */
  static async eliminar(id) {
    const [resultado] = await pool.query(
      'DELETE FROM mensualidades WHERE id = ?',
      [id]
    );

    return resultado.affectedRows > 0;
  }

  /**
   * Buscar por placa
   */
  static async buscarPorPlaca(placa) {
    const [mensualidades] = await pool.query(
      'SELECT * FROM mensualidades WHERE placa = ?',
      [placa.toUpperCase()]
    );

    return mensualidades;
  }

  /**
   * Buscar por número de documento
   */
  static async buscarPorDocumento(numeroDocumento) {
    const [mensualidades] = await pool.query(
      'SELECT * FROM mensualidades WHERE numero_documento = ?',
      [numeroDocumento]
    );

    return mensualidades;
  }
}

module.exports = Mensualidad;
