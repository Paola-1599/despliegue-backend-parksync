/**
 * Rutas de Autenticación para ParkSync
 * Define todos los endpoints relacionados con autenticación
 * 
 * @author ParkSync Team
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const {
  iniciarSesion,
  registrarUsuario,
  obtenerPerfil,
  verificarToken,
  listarUsuarios,
  actualizarUsuario,
  eliminarUsuario
} = require('../controllers/autenticacionController');
const { protegerRuta, verificarRol } = require('../middlewares/autenticacion');

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión con correo y contraseña
 * @access  Público
 * @body    { correo: string, contrasena: string }
 */ 
router.post('/login', iniciarSesion);

/**
 * @route   POST /api/auth/registro
 * @desc    Registrar un nuevo usuario
 * @access  Público (en producción, restringir solo a admins)
 * @body    { nombre: string, correo: string, contrasena: string, rol?: string }
 */
router.post('/registro', registrarUsuario);

/**
 * @route   GET /api/auth/perfil
 * @desc    Obtener perfil del usuario autenticado
 * @access  Privado (requiere token)
 */
router.get('/perfil', protegerRuta, obtenerPerfil);

/**
 * @route   GET /api/auth/verificar
 * @desc    Verificar si el token JWT es válido
 * @access  Privado (requiere token)
 */
router.get('/verificar', protegerRuta, verificarToken);

/**
 * @route   GET /api/auth/usuarios
 * @desc    Listar todos los usuarios (solo administrador)
 * @access  Privado (requiere token y rol administrador)
 */
router.get('/usuarios', protegerRuta, verificarRol('administrador'), listarUsuarios);

/**
 * @route   PUT /api/auth/usuarios/:id
 * @desc    Actualizar un usuario (solo administrador)
 * @access  Privado (requiere token y rol administrador)
 */
router.put('/usuarios/:id', protegerRuta, verificarRol('administrador'), actualizarUsuario);

/**
 * @route   DELETE /api/auth/usuarios/:id
 * @desc    Eliminar un usuario (solo administrador)
 * @access  Privado (requiere token y rol administrador)
 */
router.delete('/usuarios/:id', protegerRuta, verificarRol('administrador'), eliminarUsuario);

module.exports = router;
