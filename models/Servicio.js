/**
 * Modelo de Servicio de Parqueadero
 * Maneja las operaciones CRUD para registros de entrada/salida de vehículos
 */

const { pool } = require('../config/db');

class Servicio {
  /**
   * Crear nuevo registro de entrada
   */
  static async crearEntrada(datos) {
    const { tipoVehiculo, placa, horaEntrada, usuarioId } = datos;
    
    const [resultado] = await pool.query(
      `INSERT INTO servicios (tipo_vehiculo, placa, hora_entrada, usuario_id, activo) 
       VALUES (?, ?, ?, ?, 1)`,
      [tipoVehiculo, placa, horaEntrada, usuarioId]
    );

    const [servicio] = await pool.query(
      'SELECT * FROM servicios WHERE id = ?',
      [resultado.insertId]
    );

    return servicio[0];
  }

  /**
   * Buscar registro activo por placa
   */
  static async buscarActivoPorPlaca(placa) {
    const [servicios] = await pool.query(
      'SELECT * FROM servicios WHERE placa = ? AND activo = 1 ORDER BY fecha_creacion DESC LIMIT 1',
      [placa]
    );

    return servicios[0] || null;
  }

  /**
   * Buscar servicio por ID
   */
  static async buscarPorId(id) {
    const [servicios] = await pool.query(
      'SELECT * FROM servicios WHERE id = ?',
      [id]
    );

    return servicios[0] || null;
  }

  /**
   * Registrar salida y calcular costo
   */
  static async registrarSalida(id, horaSalida, costo) {
    await pool.query(
      'UPDATE servicios SET hora_salida = ?, costo = ?, activo = 0 WHERE id = ?',
      [horaSalida, costo, id]
    );

    return await this.buscarPorId(id);
  }

  /**
   * Obtener todos los servicios con filtros opcionales
   */
  static async obtenerTodos(filtros = {}) {
    let query = 'SELECT * FROM servicios WHERE 1=1';
    const params = [];

    if (filtros.activo !== undefined) {
      query += ' AND activo = ?';
      params.push(filtros.activo);
    }

    if (filtros.placa) {
      query += ' AND placa LIKE ?';
      params.push(`%${filtros.placa}%`);
    }

    if (filtros.fechaInicio) {
      query += ' AND DATE(fecha_creacion) >= ?';
      params.push(filtros.fechaInicio);
    }

    if (filtros.fechaFin) {
      query += ' AND DATE(fecha_creacion) <= ?';
      params.push(filtros.fechaFin);
    }

    query += ' ORDER BY fecha_creacion DESC';

    if (filtros.limite) {
      query += ' LIMIT ?';
      params.push(parseInt(filtros.limite));
    }

    const [servicios] = await pool.query(query, params);
    return servicios;
  }

  /**
   * Actualizar contador de fotos de entrada
   */
  static async actualizarFotosEntrada(servicioId, cantidad) {
    const [resultado] = await pool.query(
      'UPDATE servicios SET fotos_entrada_count = ? WHERE id = ?',
      [cantidad, servicioId]
    );
    return resultado.affectedRows > 0;
  }
}

module.exports = Servicio;
