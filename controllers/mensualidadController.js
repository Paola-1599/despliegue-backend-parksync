/**
 * Controlador de Mensualidades
 * Maneja las peticiones HTTP para gestión de membresías
 */

const Mensualidad = require('../models/Mensualidad');

class MensualidadController {
  /**
   * Crear nueva mensualidad
   */
  static async crear(req, res) {
    try {
      const {
        nombreCompleto,
        tipoDocumento,
        numeroDocumento,
        telefono,
        correo,
        placa,
        tipoVehiculo,
        marca,
        color,
        es24_7,
        fechaInicio,
        fechaVencimiento,
        valorMensual,
        estado
      } = req.body;

      // Validar datos requeridos
      if (!nombreCompleto || !numeroDocumento || !telefono || !correo || !placa || 
          !marca || !color || !fechaInicio || !fechaVencimiento || !valorMensual) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Faltan datos requeridos'
        });
      }

      const mensualidad = await Mensualidad.crear({
        nombreCompleto,
        tipoDocumento,
        numeroDocumento,
        telefono,
        correo,
        placa,
        tipoVehiculo,
        marca,
        color,
        es24_7: es24_7 || false,
        fechaInicio,
        fechaVencimiento,
        valorMensual,
        estado: estado || 'activo',
        usuarioId: req.usuario.idUsuario
      });

      res.status(201).json({
        exito: true,
        mensaje: 'Mensualidad creada correctamente',
        mensualidad
      });
    } catch (error) {
      console.error('Error al crear mensualidad:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al crear la mensualidad',
        error: error.message
      });
    }
  }

  /**
   * Obtener todas las mensualidades
   */
  static async obtenerTodas(req, res) {
    try {
      const mensualidades = await Mensualidad.obtenerTodas();

      res.json({
        exito: true,
        mensualidades
      });
    } catch (error) {
      console.error('Error al obtener mensualidades:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener mensualidades',
        error: error.message
      });
    }
  }

  /**
   * Obtener mensualidades del usuario autenticado
   */
  static async obtenerPorUsuario(req, res) {
    try {
      const mensualidades = await Mensualidad.obtenerPorUsuario(req.usuario.idUsuario);

      res.json({
        exito: true,
        mensualidades
      });
    } catch (error) {
      console.error('Error al obtener mensualidades:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener mensualidades',
        error: error.message
      });
    }
  }

  /**
   * Obtener mensualidad por ID
   */
  static async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const mensualidad = await Mensualidad.buscarPorId(id);

      if (!mensualidad) {
        return res.status(404).json({
          exito: false,
          mensaje: 'Mensualidad no encontrada'
        });
      }

      res.json({
        exito: true,
        mensualidad
      });
    } catch (error) {
      console.error('Error al obtener mensualidad:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener mensualidad',
        error: error.message
      });
    }
  }

  /**
   * Actualizar mensualidad
   */
  static async actualizar(req, res) {
    try {
      const { id } = req.params;
      const {
        nombreCompleto,
        tipoDocumento,
        numeroDocumento,
        telefono,
        correo,
        placa,
        tipoVehiculo,
        marca,
        color,
        es24_7,
        fechaInicio,
        fechaVencimiento,
        valorMensual,
        estado
      } = req.body;

      // Verificar que la mensualidad existe
      const mensualidad = await Mensualidad.buscarPorId(id);
      if (!mensualidad) {
        return res.status(404).json({
          exito: false,
          mensaje: 'Mensualidad no encontrada'
        });
      }

      const actualizada = await Mensualidad.actualizar(id, {
        nombreCompleto,
        tipoDocumento,
        numeroDocumento,
        telefono,
        correo,
        placa,
        tipoVehiculo,
        marca,
        color,
        es24_7: es24_7 || false,
        fechaInicio,
        fechaVencimiento,
        valorMensual,
        estado
      });

      res.json({
        exito: true,
        mensaje: 'Mensualidad actualizada correctamente',
        mensualidad: actualizada
      });
    } catch (error) {
      console.error('Error al actualizar mensualidad:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al actualizar la mensualidad',
        error: error.message
      });
    }
  }

  /**
   * Eliminar mensualidad
   */
  static async eliminar(req, res) {
    try {
      const { id } = req.params;

      // Verificar que la mensualidad existe
      const mensualidad = await Mensualidad.buscarPorId(id);
      if (!mensualidad) {
        return res.status(404).json({
          exito: false,
          mensaje: 'Mensualidad no encontrada'
        });
      }

      const eliminada = await Mensualidad.eliminar(id);

      if (!eliminada) {
        return res.status(400).json({
          exito: false,
          mensaje: 'No se pudo eliminar la mensualidad'
        });
      }

      res.json({
        exito: true,
        mensaje: 'Mensualidad eliminada correctamente'
      });
    } catch (error) {
      console.error('Error al eliminar mensualidad:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al eliminar la mensualidad',
        error: error.message
      });
    }
  }

  /**
   * Buscar por placa
   */
  static async buscarPorPlaca(req, res) {
    try {
      const { placa } = req.params;
      const mensualidades = await Mensualidad.buscarPorPlaca(placa);

      res.json({
        exito: true,
        mensualidades
      });
    } catch (error) {
      console.error('Error al buscar por placa:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al buscar mensualidades',
        error: error.message
      });
    }
  }

  /**
   * Buscar por documento
   */
  static async buscarPorDocumento(req, res) {
    try {
      const { documento } = req.params;
      const mensualidades = await Mensualidad.buscarPorDocumento(documento);

      res.json({
        exito: true,
        mensualidades
      });
    } catch (error) {
      console.error('Error al buscar por documento:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al buscar mensualidades',
        error: error.message
      });
    }
  }
}

module.exports = MensualidadController;
