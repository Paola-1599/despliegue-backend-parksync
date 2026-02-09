const { pool } = require('../config/db');
const fs = require('fs').promises;
const path = require('path');

class Foto {
  /**
   * Guardar foto en sistema de archivos local
   * @param {number} servicioId - ID del servicio
   * @param {string} imagenUrl - Ruta relativa del archivo: /uploads/filename.jpg
   * @param {string} tipo - Tipo de foto (entrada_derecha, entrada_izquierda, entrada_atras, salida)
   * @param {string} placaDetectada - Placa detectada por OCR
   * @param {number} confianzaOcr - Confianza de OCR (0-1)
   * @returns {Promise<Object>} Foto guardada
   */
  static async guardarFoto(servicioId, imagenUrl, tipo, placaDetectada = null, confianzaOcr = null) {
    const query = `
      INSERT INTO fotos (servicio_id, imagen_url, tipo, placa_detectada, confianza_ocr)
      VALUES (?, ?, ?, ?, ?)
    `;

    try {
      const [result] = await pool.query(query, [
        servicioId,
        imagenUrl,
        tipo,
        placaDetectada,
        confianzaOcr
      ]);

      return {
        id: result.insertId,
        servicioId,
        imagenUrl,
        tipo,
        placaDetectada,
        confianzaOcr,
        fecha_creacion: new Date()
      };
    } catch (error) {
      console.error('Error guardando foto:', error);
      throw error;
    }
  }

  /**
   * Obtener fotos de entrada de un servicio con URLs
   * @param {number} servicioId - ID del servicio
   * @returns {Promise<Array>} Array de fotos con URLs
   */
  static async obtenerFotosEntrada(servicioId) {
    const query = `
      SELECT id, imagen_url, tipo, placa_detectada, confianza_ocr, fecha_creacion
      FROM fotos
      WHERE servicio_id = ? AND tipo LIKE 'entrada_%'
      ORDER BY tipo DESC
    `;

    try {
      const [fotos] = await pool.query(query, [servicioId]);
      return fotos;
    } catch (error) {
      console.error('Error obteniendo fotos de entrada:', error);
      throw error;
    }
  }

  /**
   * Obtener foto por ID con URL
   * @param {number} fotoId - ID de la foto
   * @returns {Promise<Object>} Metadata de foto con URL
   */
  static async obtenerFotoMetadata(fotoId) {
    const query = `
      SELECT id, servicio_id, imagen_url, tipo, placa_detectada, confianza_ocr, fecha_creacion
      FROM fotos
      WHERE id = ?
    `;

    try {
      const [fotos] = await pool.query(query, [fotoId]);
      return fotos[0] || null;
    } catch (error) {
      console.error('Error obteniendo metadata de foto:', error);
      throw error;
    }
  }

  /**
   * Actualizar placa detectada (para correcciones del empleado)
   * @param {number} fotoId - ID de la foto
   * @param {string} placaCorregida - Placa corregida
   * @returns {Promise<boolean>} Success
   */
  static async actualizarPlacaDetectada(fotoId, placaCorregida) {
    const query = `
      UPDATE fotos
      SET placa_detectada = ?, confianza_ocr = 1.00
      WHERE id = ?
    `;

    try {
      const [result] = await pool.query(query, [placaCorregida, fotoId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error actualizando placa:', error);
      throw error;
    }
  }

  /**
   * Eliminar fotos de un servicio (archivos físicos y registros)
   * @param {number} servicioId - ID del servicio
   * @returns {Promise<number>} Cantidad de fotos eliminadas
   */
  static async eliminarFotosServicio(servicioId) {
    try {
      // Obtener rutas de archivos antes de eliminar registros
      const querySelect = `SELECT imagen_url FROM fotos WHERE servicio_id = ?`;
      const [fotos] = await pool.query(querySelect, [servicioId]);
      
      // Eliminar registros de base de datos
      const queryDelete = `DELETE FROM fotos WHERE servicio_id = ?`;
      const [result] = await pool.query(queryDelete, [servicioId]);
      
      // Eliminar archivos físicos
      for (const foto of fotos) {
        try {
          const rutaCompleta = path.join(__dirname, '..', foto.imagen_url);
          await fs.unlink(rutaCompleta);
        } catch (err) {
          console.warn(`No se pudo eliminar archivo ${foto.imagen_url}:`, err.message);
        }
      }
      
      return result.affectedRows;
    } catch (error) {
      console.error('Error eliminando fotos:', error);
      throw error;
    }
  }

  /**
   * Contar fotos de entrada
   * @param {number} servicioId - ID del servicio
   * @returns {Promise<number>} Cantidad de fotos
   */
  static async contarFotosEntrada(servicioId) {
    const query = `
      SELECT COUNT(*) as total
      FROM fotos
      WHERE servicio_id = ? AND tipo LIKE 'entrada_%'
    `;

    try {
      const [result] = await pool.query(query, [servicioId]);
      return result[0].total;
    } catch (error) {
      console.error('Error contando fotos:', error);
      throw error;
    }
  }
}

module.exports = Foto;
