/**
 * Rutas de Servicios de Parqueadero
 */

const express = require('express');
const router = express.Router();
const {
  registrarEntrada,
  buscarPorPlaca,
  registrarSalida,
  obtenerServicios
} = require('../controllers/servicioController');
const { protegerRuta } = require('../middlewares/autenticacion');

// Todas las rutas requieren autenticación
router.use(protegerRuta);

// POST /api/servicios/entrada - Registrar entrada de vehículo
router.post('/entrada', registrarEntrada);

// GET /api/servicios/buscar/:placa - Buscar registro activo por placa
router.get('/buscar/:placa', buscarPorPlaca);

// PUT /api/servicios/salida/:id - Registrar salida de vehículo
router.put('/salida/:id', registrarSalida);

// GET /api/servicios - Obtener todos los servicios con filtros
router.get('/', obtenerServicios);

module.exports = router;
