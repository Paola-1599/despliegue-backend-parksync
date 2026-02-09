const express = require('express');
const router = express.Router();
const configuracionController = require('../controllers/configuracionController');
const { protegerRuta, verificarRol } = require('../middlewares/autenticacion');

/**
 * Rutas de Configuración
 * Maneja precios y tarifas globales del sistema
 */

// Obtener todas las configuraciones (cualquier usuario autenticado)
router.get('/', protegerRuta, configuracionController.obtenerConfiguraciones);

// Obtener tarifa por hora (cualquier usuario autenticado)
router.get('/tarifa-hora', protegerRuta, configuracionController.obtenerTarifaHora);

// Actualizar tarifa por hora (solo administrador/supervisor)
router.put('/tarifa-hora', protegerRuta, verificarRol('administrador', 'supervisor'), configuracionController.actualizarTarifaHora);

// Obtener precio de mensualidad (cualquier usuario autenticado)
router.get('/precio-mensualidad', protegerRuta, configuracionController.obtenerPrecioMensualidad);

// Actualizar precio de mensualidad (solo administrador/supervisor)
router.put('/precio-mensualidad', protegerRuta, verificarRol('administrador', 'supervisor'), configuracionController.actualizarPrecioMensualidad);

// Obtener precio de mensualidad para motos (cualquier usuario autenticado)
router.get('/precio-mensualidad-moto', protegerRuta, configuracionController.obtenerPrecioMensualidadMoto);

// Actualizar precio de mensualidad para motos (solo administrador/supervisor)
router.put('/precio-mensualidad-moto', protegerRuta, verificarRol('administrador', 'supervisor'), configuracionController.actualizarPrecioMensualidadMoto);

// Obtener precio de mensualidad para carros (cualquier usuario autenticado)
router.get('/precio-mensualidad-carro', protegerRuta, configuracionController.obtenerPrecioMensualidadCarro);

// Actualizar precio de mensualidad para carros (solo administrador/supervisor)
router.put('/precio-mensualidad-carro', protegerRuta, verificarRol('administrador', 'supervisor'), configuracionController.actualizarPrecioMensualidadCarro);

module.exports = router;
