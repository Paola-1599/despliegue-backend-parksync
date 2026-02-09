/**
 * Controlador de Configuración
 * Maneja los precios y tarifas globales del sistema
 */

const Configuracion = require('../models/Configuracion');

/**
 * Obtiene la tarifa por hora actual
 */
const obtenerTarifaHora = async (req, res) => {
  try {
    const tarifa = await Configuracion.obtenerTarifaHora();

    if (tarifa === null) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Tarifa por hora no configurada'
      });
    }

    res.status(200).json({
      exito: true,
      tarifaHora: tarifa
    });
  } catch (error) {
    console.error('Error en obtenerTarifaHora:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error interno del servidor'
    });
  }
};

/**
 * Actualiza la tarifa por hora
 */
const actualizarTarifaHora = async (req, res) => {
  try {
    const { tarifaHora } = req.body;

    if (tarifaHora === undefined) {
      return res.status(400).json({
        exito: false,
        mensaje: 'tarifaHora es requerida'
      });
    }

    const tarifa = await Configuracion.actualizarTarifaHora(tarifaHora);

    res.status(200).json({
      exito: true,
      mensaje: 'Tarifa por hora actualizada correctamente',
      tarifaHora: tarifa
    });
  } catch (error) {
    console.error('Error en actualizarTarifaHora:', error);
    res.status(500).json({
      exito: false,
      mensaje: error.message || 'Error interno del servidor'
    });
  }
};

/**
 * Obtiene el precio de mensualidad actual
 */
const obtenerPrecioMensualidad = async (req, res) => {
  try {
    const precio = await Configuracion.obtenerPrecioMensualidad();

    if (precio === null) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Precio de mensualidad no configurado'
      });
    }

    res.status(200).json({
      exito: true,
      precioMensualidad: precio
    });
  } catch (error) {
    console.error('Error en obtenerPrecioMensualidad:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error interno del servidor'
    });
  }
};

/**
 * Actualiza el precio de mensualidad
 */
const actualizarPrecioMensualidad = async (req, res) => {
  try {
    const { precioMensualidad } = req.body;

    if (precioMensualidad === undefined) {
      return res.status(400).json({
        exito: false,
        mensaje: 'precioMensualidad es requerida'
      });
    }

    const precio = await Configuracion.actualizarPrecioMensualidad(precioMensualidad);

    res.status(200).json({
      exito: true,
      mensaje: 'Precio de mensualidad actualizado correctamente',
      precioMensualidad: precio
    });
  } catch (error) {
    console.error('Error en actualizarPrecioMensualidad:', error);
    res.status(500).json({
      exito: false,
      mensaje: error.message || 'Error interno del servidor'
    });
  }
};

/**
 * Obtiene todas las configuraciones
 */
const obtenerConfiguraciones = async (req, res) => {
  try {
    const config = await Configuracion.obtenerTodas();

    res.status(200).json({
      exito: true,
      configuraciones: {
        tarifaHora: config.tarifa_hora || null,
        precioMensualidad: config.precio_mensualidad || null,
        precioMensualidadMoto: config.precio_mensualidad_moto || null,
        precioMensualidadCarro: config.precio_mensualidad_carro || null
      }
    });
  } catch (error) {
    console.error('Error en obtenerConfiguraciones:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error interno del servidor'
    });
  }
};

/**
 * Obtiene el precio de mensualidad para motos
 */
const obtenerPrecioMensualidadMoto = async (req, res) => {
  try {
    const precio = await Configuracion.obtenerPrecioMensualidadMoto();

    if (precio === null) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Precio de mensualidad para motos no configurado'
      });
    }

    res.status(200).json({
      exito: true,
      precioMensualidadMoto: precio
    });
  } catch (error) {
    console.error('Error en obtenerPrecioMensualidadMoto:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error interno del servidor'
    });
  }
};

/**
 * Actualiza el precio de mensualidad para motos
 */
const actualizarPrecioMensualidadMoto = async (req, res) => {
  try {
    const { precioMensualidadMoto } = req.body;

    if (precioMensualidadMoto === undefined) {
      return res.status(400).json({
        exito: false,
        mensaje: 'precioMensualidadMoto es requerido'
      });
    }

    const precio = await Configuracion.actualizarPrecioMensualidadMoto(precioMensualidadMoto);

    res.status(200).json({
      exito: true,
      mensaje: 'Precio de mensualidad para motos actualizado correctamente',
      precioMensualidadMoto: precio
    });
  } catch (error) {
    console.error('Error en actualizarPrecioMensualidadMoto:', error);
    res.status(500).json({
      exito: false,
      mensaje: error.message || 'Error interno del servidor'
    });
  }
};

/**
 * Obtiene el precio de mensualidad para carros
 */
const obtenerPrecioMensualidadCarro = async (req, res) => {
  try {
    const precio = await Configuracion.obtenerPrecioMensualidadCarro();

    if (precio === null) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Precio de mensualidad para carros no configurado'
      });
    }

    res.status(200).json({
      exito: true,
      precioMensualidadCarro: precio
    });
  } catch (error) {
    console.error('Error en obtenerPrecioMensualidadCarro:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error interno del servidor'
    });
  }
};

/**
 * Actualiza el precio de mensualidad para carros
 */
const actualizarPrecioMensualidadCarro = async (req, res) => {
  try {
    const { precioMensualidadCarro } = req.body;

    if (precioMensualidadCarro === undefined) {
      return res.status(400).json({
        exito: false,
        mensaje: 'precioMensualidadCarro es requerido'
      });
    }

    const precio = await Configuracion.actualizarPrecioMensualidadCarro(precioMensualidadCarro);

    res.status(200).json({
      exito: true,
      mensaje: 'Precio de mensualidad para carros actualizado correctamente',
      precioMensualidadCarro: precio
    });
  } catch (error) {
    console.error('Error en actualizarPrecioMensualidadCarro:', error);
    res.status(500).json({
      exito: false,
      mensaje: error.message || 'Error interno del servidor'
    });
  }
};

module.exports = {
  obtenerTarifaHora,
  actualizarTarifaHora,
  obtenerPrecioMensualidad,
  actualizarPrecioMensualidad,
  obtenerConfiguraciones,
  obtenerPrecioMensualidadMoto,
  actualizarPrecioMensualidadMoto,
  obtenerPrecioMensualidadCarro,
  actualizarPrecioMensualidadCarro
};
