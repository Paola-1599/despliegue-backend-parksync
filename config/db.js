/**
 * Configuración de conexión a la base de datos MySQL
 * ParkSync - Sistema de Gestión de Estacionamiento
 * 
 * @author ParkSync Team
 * @version 1.0.0
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Pool de conexiones a MySQL
 * Permite reutilizar conexiones para mejor rendimiento
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Función para verificar la conexión a la base de datos
 * @returns {Promise<boolean>} True si la conexión es exitosa
 */
const verificarConexion = async () => {
  try {
    const conexion = await pool.getConnection();
    console.log('✅ Conexión a MySQL establecida correctamente');
    conexion.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  verificarConexion
};
