/**
 * Controlador de Autenticación para ParkSync
 * Maneja las peticiones HTTP relacionadas con autenticación de usuarios
 * 
 * @author ParkSync Team
 * @version 1.0.0
 */

const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');

/**
 * Genera un token JWT para un usuario
 * 
 * @param {Object} usuario - Datos del usuario
 * @returns {string} Token JWT
 */
const generarToken = (usuario) => {
  return jwt.sign(
    {
      idUsuario: usuario.idUsuario,
      correo: usuario.correo,
      rol: usuario.rol
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    }
  );
};

/**
 * Controlador para iniciar sesión
 * POST /api/auth/login
 * 
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 */

const iniciarSesion = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    // Validación: Verificar que se envíen los datos requeridos
    if (!correo || !contrasena) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Por favor proporciona correo y contraseña'
      });
    }

    // Buscar el usuario por correo
    const usuario = await Usuario.buscarPorCorreo(correo);

    if (!usuario) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Credenciales inválidas'
      });
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return res.status(403).json({
        exito: false,
        mensaje: 'Tu cuenta ha sido desactivada. Contacta al administrador.'
      });
    }

    // Verificar la contraseña
    const contrasenaValida = await Usuario.verificarContrasena(
      contrasena,
      usuario.contrasena
    );

    if (!contrasenaValida) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Credenciales inválidas'
      });
    }

    // Actualizar último acceso
    await Usuario.actualizarUltimoAcceso(usuario.idUsuario);

    // Generar token JWT
    const token = generarToken(usuario);

    // Respuesta exitosa
    res.status(200).json({
      exito: true,
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        idUsuario: usuario.idUsuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        tipo_documento: usuario.tipo_documento,
        numero_documento: usuario.numero_documento
      }
    });

  } catch (error) {
    console.error('Error en iniciarSesion:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Controlador para registrar un nuevo usuario
 * POST /api/auth/registro
 * 
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 */
const registrarUsuario = async (req, res) => {
  try {
    const { nombre, correo, contrasena, rol, tipoDocumento, numeroDocumento } = req.body;

    // Validación: Verificar que se envíen los datos requeridos
    if (!nombre || !correo || !contrasena || !tipoDocumento || !numeroDocumento) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Por favor proporciona nombre, correo, contraseña, tipoDocumento y numeroDocumento'
      });
    }

    // Validación: Formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El formato del correo electrónico no es válido'
      });
    }

    // Validación: Longitud mínima de contraseña
    if (contrasena.length < 6) {
      return res.status(400).json({
        exito: false,
        mensaje: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.buscarPorCorreo(correo);
    if (usuarioExistente) {
      return res.status(409).json({
        exito: false,
        mensaje: 'Ya existe un usuario con ese correo electrónico'
      });
    }

    // Crear el nuevo usuario
    const nuevoUsuario = await Usuario.crear({
      nombre,
      correo,
      contrasena,
      rol: rol || 'empleado',
      tipoDocumento,
      numeroDocumento
    });

    // Generar token JWT
    const token = generarToken(nuevoUsuario);

    // Respuesta exitosa
    res.status(201).json({
      exito: true,
      mensaje: 'Usuario registrado exitosamente',
      token,
      usuario: {
        idUsuario: nuevoUsuario.idUsuario,
        nombre: nuevoUsuario.nombre,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol,
        tipo_documento: nuevoUsuario.tipo_documento,
        numero_documento: nuevoUsuario.numero_documento
      }
    });

  } catch (error) {
    console.error('Error en registrarUsuario:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Controlador para obtener el perfil del usuario autenticado
 * GET /api/auth/perfil
 * 
 * @param {Object} req - Request de Express (con req.usuario del middleware)
 * @param {Object} res - Response de Express
 */
const obtenerPerfil = async (req, res) => {
  try {
    // El usuario viene del middleware de autenticación
    const usuario = await Usuario.buscarPorId(req.usuario.idUsuario);

    if (!usuario) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      exito: true,
      usuario: {
        idUsuario: usuario.idUsuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        tipo_documento: usuario.tipo_documento,
        numero_documento: usuario.numero_documento,
        activo: usuario.activo,
        fechaCreacion: usuario.fecha_creacion
      }
    });

  } catch (error) {
    console.error('Error en obtenerPerfil:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Controlador para verificar si el token es válido
 * GET /api/auth/verificar
 * 
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 */
const verificarToken = async (req, res) => {
  try {
    // Si llegamos aquí, el token es válido (verificado por el middleware)
    res.status(200).json({
      exito: true,
      mensaje: 'Token válido',
      usuario: req.usuario
    });
  } catch (error) {
    console.error('Error en verificarToken:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error interno del servidor'
    });
  }
};

/**
 * Controlador para listar todos los usuarios
 * GET /api/auth/usuarios
 * 
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 */
const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.obtenerTodos();
    
    res.status(200).json({
      exito: true,
      usuarios: usuarios.map(u => ({
        idUsuario: u.idUsuario,
        nombre: u.nombre,
        correo: u.correo,
        rol: u.rol,
        tipo_documento: u.tipo_documento,
        numero_documento: u.numero_documento,
        activo: u.activo,
        fechaCreacion: u.fecha_creacion,
        ultimoAcceso: u.ultimo_acceso
      }))
    });
  } catch (error) {
    console.error('Error en listarUsuarios:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener usuarios'
    });
  }
};

/**
 * Controlador para actualizar un usuario
 * PUT /api/auth/usuarios/:id
 * 
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 */
const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, correo, rol, activo, tipo_documento, numero_documento } = req.body;

    if (!nombre || !correo || !rol) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Nombre, correo y rol son requeridos'
      });
    }

    // Verificar que el usuario existe
    const usuarioExiste = await Usuario.buscarPorId(id);
    if (!usuarioExiste) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    // Actualizar usuario
    await Usuario.actualizar(id, { nombre, correo, rol, activo, tipo_documento, numero_documento });

    res.status(200).json({
      exito: true,
      mensaje: 'Usuario actualizado correctamente'
    });
  } catch (error) {
    console.error('Error en actualizarUsuario:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al actualizar usuario'
    });
  }
};

/**
 * Controlador para eliminar un usuario
 * DELETE /api/auth/usuarios/:id
 * 
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 */
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario existe
    const usuarioExiste = await Usuario.buscarPorId(id);
    if (!usuarioExiste) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    // No permitir eliminar al propio usuario
    if (req.usuario.idUsuario === parseInt(id)) {
      return res.status(400).json({
        exito: false,
        mensaje: 'No puedes eliminar tu propia cuenta'
      });
    }

    // Eliminar usuario
    await Usuario.eliminar(id);

    res.status(200).json({
      exito: true,
      mensaje: 'Usuario eliminado correctamente'
    });
  } catch (error) {
    console.error('Error en eliminarUsuario:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al eliminar usuario'
    });
  }
};

module.exports = {
  iniciarSesion,
  registrarUsuario,
  obtenerPerfil,
  verificarToken,
  listarUsuarios,
  actualizarUsuario,
  eliminarUsuario
};
