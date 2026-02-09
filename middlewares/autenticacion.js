/**
 * Middleware de Autenticación para ParkSync
 * Verifica y valida tokens JWT en las peticiones
 * 
 * @author ParkSync Team
 * @version 1.0.0
 */

const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

/**
 * Middleware para proteger rutas que requieren autenticación
 * Verifica el token JWT en el header Authorization
 * 
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Siguiente middleware
 */
const protegerRuta = async (req, res, next) => {
  try {
    // Obtener el token del header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        exito: false,
        mensaje: 'No autorizado. Token no proporcionado.'
      });
    }

    // Extraer el token
    const token = authHeader.split(' ')[1];

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.idUsuario || decoded.id;

    // Verificar que el usuario existe y está activo
    const usuario = await Usuario.buscarPorId(userId);

    if (!usuario) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Token inválido. Usuario no encontrado.'
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        exito: false,
        mensaje: 'Usuario desactivado. Contacta al administrador.'
      });
    }

    // Agregar información del usuario al request
    req.usuario = {
      idUsuario: usuario.idUsuario,
      correo: usuario.correo,
      rol: usuario.rol,
      nombre: usuario.nombre,
      tipo_documento: usuario.tipo_documento,
      numero_documento: usuario.numero_documento
    };

    next();

  } catch (error) {
    console.error('Error en protegerRuta:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        exito: false,
        mensaje: 'Token inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        exito: false,
        mensaje: 'Token expirado. Por favor inicia sesión nuevamente.'
      });
    }

    res.status(500).json({
      exito: false,
      mensaje: 'Error al verificar autenticación'
    });
  }
};

/**
 * Middleware para verificar que el usuario tiene un rol específico
 * 
 * @param {...string} rolesPermitidos - Roles que pueden acceder a la ruta
 * @returns {Function} Middleware de Express
 */
const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        exito: false,
        mensaje: 'No autorizado'
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        exito: false,
        mensaje: 'No tienes permisos para acceder a este recurso'
      });
    }

    next();
  };
};

module.exports = {
  protegerRuta,
  verificarRol
};
