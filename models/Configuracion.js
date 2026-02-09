/**
 * Modelo de Configuración
 * Maneja parámetros globales como tarifa por hora y precio de mensualidad
 */

const { pool } = require('../config/db');

class Configuracion {
  /**
   * Obtiene la tarifa por hora para servicios
   * @returns {Promise<number|null>} Tarifa por hora o null si no existe
   */
  static async obtenerTarifaHora() {
    const [rows] = await pool.query(
      'SELECT precioHora FROM configuracion ORDER BY idConfiguracion DESC LIMIT 1'
    );

    if (rows.length === 0) {
      return null;
    }

    const valor = parseFloat(rows[0].precioHora);
    return Number.isNaN(valor) ? null : valor;
  }

  /**
   * Actualiza la tarifa por hora
   * @param {number} nuevaTarifa - Nueva tarifa en COP
   * @returns {Promise<number>} Tarifa actualizada
   */
  static async actualizarTarifaHora(nuevaTarifa) {
    const tarifa = parseFloat(nuevaTarifa);
    if (Number.isNaN(tarifa) || tarifa <= 0) {
      throw new Error('Tarifa inválida');
    }

    await pool.query(
      'UPDATE configuracion SET precioHora = ?, fechaActualizacion = CURRENT_TIMESTAMP WHERE idConfiguracion = 1',
      [tarifa]
    );

    return tarifa;
  }

  /**
   * Obtiene el precio de mensualidad
   * @returns {Promise<number|null>} Precio de mensualidad o null si no existe
   */
  static async obtenerPrecioMensualidad() {
    const [rows] = await pool.query(
      'SELECT precioMensualidad FROM configuracion ORDER BY idConfiguracion DESC LIMIT 1'
    );

    if (rows.length === 0) {
      return null;
    }

    const valor = parseFloat(rows[0].precioMensualidad);
    return Number.isNaN(valor) ? null : valor;
  }

  /**
   * Actualiza el precio de mensualidad
   * @param {number} nuevoPrecio - Nuevo precio en COP
   * @returns {Promise<number>} Precio actualizado
   */
  static async actualizarPrecioMensualidad(nuevoPrecio) {
    const precio = parseFloat(nuevoPrecio);
    if (Number.isNaN(precio) || precio <= 0) {
      throw new Error('Precio inválido');
    }

    await pool.query(
      'UPDATE configuracion SET precioMensualidad = ?, fechaActualizacion = CURRENT_TIMESTAMP WHERE idConfiguracion = 1',
      [precio]
    );

    return precio;
  }

  /**
   * Obtiene el precio de mensualidad para motos
   * @returns {Promise<number|null>} Precio de mensualidad para motos o null si no existe
   */
  static async obtenerPrecioMensualidadMoto() {
    const [rows] = await pool.query(
      'SELECT precio_mensualidad_moto FROM configuracion ORDER BY idConfiguracion DESC LIMIT 1'
    );

    if (rows.length === 0) {
      return null;
    }

    const valor = parseFloat(rows[0].precio_mensualidad_moto);
    return Number.isNaN(valor) ? null : valor;
  }

  /**
   * Actualiza el precio de mensualidad para motos
   * @param {number} nuevoPrecio - Nuevo precio en COP
   * @returns {Promise<number>} Precio actualizado
   */
  static async actualizarPrecioMensualidadMoto(nuevoPrecio) {
    const precio = parseFloat(nuevoPrecio);
    if (Number.isNaN(precio) || precio <= 0) {
      throw new Error('Precio inválido');
    }

    await pool.query(
      'UPDATE configuracion SET precio_mensualidad_moto = ?, fechaActualizacion = CURRENT_TIMESTAMP WHERE idConfiguracion = 1',
      [precio]
    );

    return precio;
  }

  /**
   * Obtiene el precio de mensualidad para carros
   * @returns {Promise<number|null>} Precio de mensualidad para carros o null si no existe
   */
  static async obtenerPrecioMensualidadCarro() {
    const [rows] = await pool.query(
      'SELECT precio_mensualidad_carro FROM configuracion ORDER BY idConfiguracion DESC LIMIT 1'
    );

    if (rows.length === 0) {
      return null;
    }

    const valor = parseFloat(rows[0].precio_mensualidad_carro);
    return Number.isNaN(valor) ? null : valor;
  }

  /**
   * Actualiza el precio de mensualidad para carros
   * @param {number} nuevoPrecio - Nuevo precio en COP
   * @returns {Promise<number>} Precio actualizado
   */
  static async actualizarPrecioMensualidadCarro(nuevoPrecio) {
    const precio = parseFloat(nuevoPrecio);
    if (Number.isNaN(precio) || precio <= 0) {
      throw new Error('Precio inválido');
    }

    await pool.query(
      'UPDATE configuracion SET precio_mensualidad_carro = ?, fechaActualizacion = CURRENT_TIMESTAMP WHERE idConfiguracion = 1',
      [precio]
    );

    return precio;
  }

  /**
   * Obtiene todas las configuraciones
   * @returns {Promise<Object>} Objeto con todas las configuraciones
   */
  static async obtenerTodas() {
    const [rows] = await pool.query(
      'SELECT precioHora, precioMensualidad, precio_mensualidad_moto, precio_mensualidad_carro FROM configuracion ORDER BY idConfiguracion DESC LIMIT 1'
    );

    if (rows.length === 0) {
      return { 
        tarifaHora: 0, 
        precioMensualidad: 0,
        precioMensualidadMoto: 0,
        precioMensualidadCarro: 0
      };
    }

    return {
      tarifaHora: parseFloat(rows[0].precioHora),
      precioMensualidad: parseFloat(rows[0].precioMensualidad),
      precioMensualidadMoto: parseFloat(rows[0].precio_mensualidad_moto),
      precioMensualidadCarro: parseFloat(rows[0].precio_mensualidad_carro)
    };
  }
}

module.exports = Configuracion;
