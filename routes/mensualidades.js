/**
 * Rutas de Mensualidades
 */

const express = require('express');
const router = express.Router();
const MensualidadController = require('../controllers/mensualidadController');
const { protegerRuta } = require('../middlewares/autenticacion');

// Todas las rutas requieren autenticación
router.use(protegerRuta);

// POST /api/mensualidades - Crear nueva mensualidad
router.post('/', MensualidadController.crear);

// GET /api/mensualidades - Obtener todas las mensualidades
router.get('/', MensualidadController.obtenerTodas);

// GET /api/mensualidades/usuario - Obtener mensualidades del usuario autenticado
router.get('/usuario', MensualidadController.obtenerPorUsuario);

// GET /api/mensualidades/:id - Obtener mensualidad por ID
router.get('/:id', MensualidadController.obtenerPorId);

// PUT /api/mensualidades/:id - Actualizar mensualidad
router.put('/:id', MensualidadController.actualizar);

// DELETE /api/mensualidades/:id - Eliminar mensualidad
router.delete('/:id', MensualidadController.eliminar);

// GET /api/mensualidades/buscar/placa/:placa - Buscar por placa
router.get('/buscar/placa/:placa', MensualidadController.buscarPorPlaca);

// GET /api/mensualidades/buscar/documento/:documento - Buscar por documento
router.get('/buscar/documento/:documento', MensualidadController.buscarPorDocumento);

module.exports = router;
