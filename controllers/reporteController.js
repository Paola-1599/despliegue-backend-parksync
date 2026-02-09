/**
 * Controlador de Reportes
 * Maneja las peticiones de reportes y análisis de datos
 */

const Reporte = require('../models/Reporte');

/**
 * Obtiene el reporte general con filtros
 * GET /api/reportes
 */
const obtenerReporteGeneral = async (req, res) => {
  try {
    const { mes, anio, tipoVehiculo } = req.query;

    const filtros = {};
    
    if (mes) filtros.mes = parseInt(mes);
    if (anio) filtros.anio = parseInt(anio);
    if (tipoVehiculo) filtros.tipoVehiculo = tipoVehiculo;

    const datos = await Reporte.obtenerReporteGeneral(filtros);
    const resumen = await Reporte.obtenerResumenIngresos(filtros);

    res.status(200).json({
      exito: true,
      datos,
      resumen
    });
  } catch (error) {
    console.error('Error en obtenerReporteGeneral:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener reportes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtiene solo el resumen de ingresos
 * GET /api/reportes/resumen
 */
const obtenerResumen = async (req, res) => {
  try {
    const { mes, anio, tipoVehiculo } = req.query;

    const filtros = {};
    
    if (mes) filtros.mes = parseInt(mes);
    if (anio) filtros.anio = parseInt(anio);
    if (tipoVehiculo) filtros.tipoVehiculo = tipoVehiculo;

    const resumen = await Reporte.obtenerResumenIngresos(filtros);

    res.status(200).json({
      exito: true,
      resumen
    });
  } catch (error) {
    console.error('Error en obtenerResumen:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener resumen',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtiene ingresos diarios
 * GET /api/reportes/ingresos-diarios
 */
const obtenerIngresosDiarios = async (req, res) => {
  try {
    const { tipo, tipoVehiculo, fecha } = req.query;

    const filtros = {};
    
    if (tipo) filtros.tipo = tipo;
    if (tipoVehiculo) filtros.tipoVehiculo = tipoVehiculo;
    if (fecha) filtros.fecha = fecha;

    const datos = await Reporte.obtenerIngresosDiarios(filtros);
    const resumen = await Reporte.obtenerResumenIngresosDiarios(filtros);

    res.status(200).json({
      exito: true,
      datos,
      resumen
    });
  } catch (error) {
    console.error('Error en obtenerIngresosDiarios:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener ingresos diarios',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  obtenerReporteGeneral,
  obtenerResumen,
  obtenerIngresosDiarios
};
