/**
 * Rutas de Reportes
 * Define endpoints para generación de reportes y análisis
 */

const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const { protegerRuta, verificarRol } = require('../middlewares/autenticacion');

/**
 * @route   GET /api/reportes
 * @desc    Obtiene reporte general con filtros
 * @access  Privado (supervisor, administrador)
 * @query   { mes?: number, anio?: number, tipoVehiculo?: string }
 */
router.get('/', protegerRuta, verificarRol('supervisor', 'administrador'), reporteController.obtenerReporteGeneral);

/**
 * @route   GET /api/reportes/resumen
 * @desc    Obtiene resumen de ingresos
 * @access  Privado (supervisor, administrador)
 * @query   { mes?: number, anio?: number, tipoVehiculo?: string }
 */
router.get('/resumen', protegerRuta, verificarRol('supervisor', 'administrador'), reporteController.obtenerResumen);

/**
 * @route   GET /api/reportes/ingresos-diarios
 * @desc    Obtiene ingresos diarios (de hoy)
 * @access  Privado (supervisor, administrador)
 * @query   { tipo?: 'servicios'|'mensualidades'|'todos', tipoVehiculo?: string }
 */
router.get('/ingresos-diarios', protegerRuta, verificarRol('supervisor', 'administrador'), reporteController.obtenerIngresosDiarios);

module.exports = router;
