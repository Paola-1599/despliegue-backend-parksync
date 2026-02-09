/**
 * Controlador de Servicios de Parqueadero
 */

const Servicio = require('../models/Servicio');
const Configuracion = require('../models/Configuracion');

const calcularMinutos = (entrada, salida) => {
  const [hE, mE] = entrada.split(':').map(Number);
  const [hS, mS] = salida.split(':').map(Number);
  const entradaMin = hE * 60 + mE;
  const salidaMin = hS * 60 + mS;
  return salidaMin - entradaMin;
};

/**
 * Registrar entrada de vehículo
 * POST /api/servicios/entrada
 */
const registrarEntrada = async (req, res) => {
  try {
    const tipoVehiculo = req.body.tipoVehiculo || req.body.tipo_vehiculo;
    const placa = req.body.placa;
    const horaEntrada = req.body.horaEntrada || req.body.hora_entrada;

    if (!tipoVehiculo || !placa || !horaEntrada) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Todos los campos son requeridos'
      });
    }

    // Verificar si hay registro activo con la misma placa
    const registroActivo = await Servicio.buscarActivoPorPlaca(placa);
    if (registroActivo) {
      return res.status(409).json({
        exito: false,
        mensaje: 'Ya existe un registro activo para esta placa'
      });
    }

    const servicio = await Servicio.crearEntrada({
      tipoVehiculo,
      placa: placa.toUpperCase(),
      horaEntrada,
      usuarioId: req.usuario.idUsuario
    });

    res.status(201).json({
      exito: true,
      mensaje: 'Entrada registrada exitosamente',
      servicio
    });
  } catch (error) {
    console.error('Error en registrarEntrada:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Buscar registro activo por placa
 * GET /api/servicios/buscar/:placa
 */
const buscarPorPlaca = async (req, res) => {
  try {
    const { placa } = req.params;

    const servicio = await Servicio.buscarActivoPorPlaca(placa.toUpperCase());

    if (!servicio) {
      return res.status(404).json({
        exito: false,
        mensaje: 'No se encontró registro activo para esta placa'
      });
    }

    res.status(200).json({
      exito: true,
      servicio
    });
  } catch (error) {
    console.error('Error en buscarPorPlaca:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Registrar salida de vehículo
 * PUT /api/servicios/salida/:id
 */
const registrarSalida = async (req, res) => {
  try {
    const { id } = req.params;
    const horaSalida = req.body.horaSalida || req.body.hora_salida;

    if (!horaSalida) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Hora de salida es requerida'
      });
    }

    const servicioExistente = await Servicio.buscarPorId(id);
    if (!servicioExistente) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Servicio no encontrado'
      });
    }

    if (!servicioExistente.activo) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Este servicio ya fue cerrado'
      });
    }

    const minutos = calcularMinutos(servicioExistente.hora_entrada, horaSalida);
    if (minutos <= 0) {
      return res.status(400).json({
        exito: false,
        mensaje: 'La hora de salida debe ser posterior a la hora de entrada'
      });
    }

    const tarifaHora = await Configuracion.obtenerTarifaHora();
    if (tarifaHora === null) {
      return res.status(500).json({
        exito: false,
        mensaje: 'Tarifa por hora no configurada'
      });
    }

    const horas = Math.ceil(minutos / 60);
    const costo = horas * tarifaHora;

    const servicio = await Servicio.registrarSalida(id, horaSalida, costo);

    res.status(200).json({
      exito: true,
      mensaje: 'Salida registrada exitosamente',
      servicio,
      tarifaHora
    });
  } catch (error) {
    console.error('Error en registrarSalida:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener todos los servicios con filtros
 * GET /api/servicios
 */
const obtenerServicios = async (req, res) => {
  try {
    const filtros = {
      activo: req.query.activo,
      placa: req.query.placa,
      fechaInicio: req.query.fechaInicio,
      fechaFin: req.query.fechaFin,
      limite: req.query.limite
    };

    const servicios = await Servicio.obtenerTodos(filtros);

    res.status(200).json({
      exito: true,
      total: servicios.length,
      servicios
    });
  } catch (error) {
    console.error('Error en obtenerServicios:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  registrarEntrada,
  buscarPorPlaca,
  registrarSalida,
  obtenerServicios
};
