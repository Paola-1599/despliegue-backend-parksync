/**
 * Modelo de Reportes
 * Maneja consultas para generar reportes de servicios y mensualidades
 */

const { pool } = require('../config/db');

class Reporte {
  /**
   * Obtiene reportes combinados de servicios y mensualidades
   * @param {Object} filtros - Filtros para el reporte
   * @param {number} filtros.mes - Mes (1-12)
   * @param {number} filtros.anio - Año
   * @param {string} filtros.tipoVehiculo - Tipo de vehículo
   * @returns {Promise<Array>} Array con todos los registros
   */
  static async obtenerReporteGeneral(filtros = {}) {
    const { mes, anio, tipoVehiculo } = filtros;
    
    let condicionesServicios = [];
    let condicionesMensualidades = [];
    let parametrosServicios = [];
    let parametrosMensualidades = [];

    // Filtrar por mes - servicios usa fecha_creacion
    if (mes) {
      condicionesServicios.push('MONTH(s.fecha_creacion) = ?');
      parametrosServicios.push(mes);
      condicionesMensualidades.push('MONTH(m.fecha_inicio) = ?');
      parametrosMensualidades.push(mes);
    }

    // Filtrar por año - servicios usa fecha_creacion
    if (anio) {
      condicionesServicios.push('YEAR(s.fecha_creacion) = ?');
      parametrosServicios.push(anio);
      condicionesMensualidades.push('YEAR(m.fecha_inicio) = ?');
      parametrosMensualidades.push(anio);
    }

    // Filtrar por tipo de vehículo
    if (tipoVehiculo && tipoVehiculo !== 'todos') {
      condicionesServicios.push('s.tipo_vehiculo = ?');
      parametrosServicios.push(tipoVehiculo);
      condicionesMensualidades.push('m.tipo_vehiculo = ?');
      parametrosMensualidades.push(tipoVehiculo);
    }

    const whereServicios = condicionesServicios.length > 0 
      ? 'WHERE ' + condicionesServicios.join(' AND ')
      : '';
    
    const whereMensualidades = condicionesMensualidades.length > 0
      ? 'WHERE ' + condicionesMensualidades.join(' AND ')
      : '';

    // Consulta para servicios
    const queryServicios = `
      SELECT 
        'Servicio' AS tipo,
        s.placa,
        s.tipo_vehiculo AS tipoVehiculo,
        '' AS marca,
        '' AS color,
        '' AS nombreCliente,
        s.costo AS precio,
        CASE WHEN s.activo = 1 THEN 'activo' ELSE 'finalizado' END AS estado,
        s.fecha_creacion AS fecha,
        CONCAT(s.hora_entrada, ' - ', COALESCE(s.hora_salida, 'En espera')) AS detalles
      FROM servicios s
      ${whereServicios}
      ORDER BY s.fecha_creacion DESC
    `;

    // Consulta para mensualidades
    const queryMensualidades = `
      SELECT 
        'Mensualidad' AS tipo,
        m.placa,
        m.tipo_vehiculo AS tipoVehiculo,
        m.marca,
        m.color,
        m.nombre_completo AS nombreCliente,
        m.valor_mensual AS precio,
        m.estado,
        m.fecha_inicio AS fecha,
        CONCAT('Vence: ', DATE_FORMAT(m.fecha_vencimiento, '%d/%m/%Y')) AS detalles
      FROM mensualidades m
      ${whereMensualidades}
      ORDER BY m.fecha_inicio DESC
    `;

    try {
      const [servicios] = await pool.query(queryServicios, parametrosServicios);
      const [mensualidades] = await pool.query(queryMensualidades, parametrosMensualidades);

      // Combinar ambos resultados
      const resultados = [...servicios, ...mensualidades];

      // Ordenar por fecha descendente
      resultados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      return resultados;
    } catch (error) {
      console.error('Error en obtenerReporteGeneral:', error);
      throw error;
    }
  }

  /**
   * Obtiene resumen de ingresos
   * @param {Object} filtros - Filtros para el resumen
   * @returns {Promise<Object>} Resumen con totales
   */
  static async obtenerResumenIngresos(filtros = {}) {
    const { mes, anio, tipoVehiculo } = filtros;
    
    let condicionesServicios = [];
    let condicionesMensualidades = [];
    let parametrosServicios = [];
    let parametrosMensualidades = [];

    if (mes) {
      condicionesServicios.push('MONTH(fecha_creacion) = ?');
      parametrosServicios.push(mes);
      condicionesMensualidades.push('MONTH(fecha_inicio) = ?');
      parametrosMensualidades.push(mes);
    }

    if (anio) {
      condicionesServicios.push('YEAR(fecha_creacion) = ?');
      parametrosServicios.push(anio);
      condicionesMensualidades.push('YEAR(fecha_inicio) = ?');
      parametrosMensualidades.push(anio);
    }

    if (tipoVehiculo && tipoVehiculo !== 'todos') {
      condicionesServicios.push('tipo_vehiculo = ?');
      parametrosServicios.push(tipoVehiculo);
      condicionesMensualidades.push('tipo_vehiculo = ?');
      parametrosMensualidades.push(tipoVehiculo);
    }

    const whereServicios = condicionesServicios.length > 0 
      ? 'WHERE ' + condicionesServicios.join(' AND ')
      : '';
    
    const whereMensualidades = condicionesMensualidades.length > 0
      ? 'WHERE ' + condicionesMensualidades.join(' AND ')
      : '';

    try {
      // Total de servicios
      const [resumenServicios] = await pool.query(
        `SELECT 
          COUNT(*) AS cantidad,
          COALESCE(SUM(costo), 0) AS total
         FROM servicios ${whereServicios}`,
        parametrosServicios
      );

      // Total de mensualidades
      const [resumenMensualidades] = await pool.query(
        `SELECT 
          COUNT(*) AS cantidad,
          COALESCE(SUM(valor_mensual), 0) AS total
         FROM mensualidades ${whereMensualidades}`,
        parametrosMensualidades
      );

      return {
        servicios: {
          cantidad: resumenServicios[0].cantidad,
          total: parseFloat(resumenServicios[0].total)
        },
        mensualidades: {
          cantidad: resumenMensualidades[0].cantidad,
          total: parseFloat(resumenMensualidades[0].total)
        },
        totalGeneral: parseFloat(resumenServicios[0].total) + parseFloat(resumenMensualidades[0].total)
      };
    } catch (error) {
      console.error('Error en obtenerResumenIngresos:', error);
      throw error;
    }
  }

  /**
   * Obtiene ingresos diarios (de hoy)
   * @param {Object} filtros - Filtros para el reporte diario
   * @param {string} filtros.tipo - 'servicios', 'mensualidades', o 'todos'
   * @param {string} filtros.tipoVehiculo - Tipo de vehículo
   * @returns {Promise<Array>} Array con registros del día
   */
  static async obtenerIngresosDiarios(filtros = {}) {
    const { tipo, tipoVehiculo, fecha } = filtros;
    
    const condicionFechaServicios = fecha
      ? 'DATE(s.fecha_creacion) = ?'
      : 'DATE(s.fecha_creacion) = CURDATE()';
    const condicionFechaMensualidades = fecha
      ? 'DATE(m.fecha_inicio) = ?'
      : 'DATE(m.fecha_inicio) = CURDATE()';

    try {
      let resultados = [];

      // Obtener servicios de hoy
      if (tipo === 'servicios' || tipo === 'todos') {
        let queryServicios = `
          SELECT 
            'Servicio' AS tipo,
            s.placa,
            s.tipo_vehiculo AS tipoVehiculo,
            '' AS marca,
            '' AS color,
            '' AS nombreCliente,
            s.costo AS precio,
            CASE WHEN s.activo = 1 THEN 'activo' ELSE 'finalizado' END AS estado,
            s.fecha_creacion AS fecha,
            CONCAT(s.hora_entrada, ' - ', COALESCE(s.hora_salida, 'En espera')) AS detalles
          FROM servicios s
          WHERE ${condicionFechaServicios}
        `;

        let paramsServicios = fecha ? [fecha] : [];

        if (tipoVehiculo && tipoVehiculo !== 'todos') {
          queryServicios += ' AND s.tipo_vehiculo = ?';
          paramsServicios.push(tipoVehiculo);
        }

        queryServicios += ' ORDER BY s.fecha_creacion DESC';

        const [servicios] = await pool.query(queryServicios, paramsServicios);
        resultados = [...servicios];
      }

      // Obtener mensualidades de hoy
      if (tipo === 'mensualidades' || tipo === 'todos') {
        let queryMensualidades = `
          SELECT 
            'Mensualidad' AS tipo,
            m.placa,
            m.tipo_vehiculo AS tipoVehiculo,
            m.marca,
            m.color,
            m.nombre_completo AS nombreCliente,
            m.valor_mensual AS precio,
            m.estado,
            m.fecha_inicio AS fecha,
            CONCAT('Vence: ', DATE_FORMAT(m.fecha_vencimiento, '%d/%m/%Y')) AS detalles
          FROM mensualidades m
          WHERE ${condicionFechaMensualidades}
        `;

        let paramsMensualidades = fecha ? [fecha] : [];

        if (tipoVehiculo && tipoVehiculo !== 'todos') {
          queryMensualidades += ' AND m.tipo_vehiculo = ?';
          paramsMensualidades.push(tipoVehiculo);
        }

        queryMensualidades += ' ORDER BY m.fecha_inicio DESC';

        const [mensualidades] = await pool.query(queryMensualidades, paramsMensualidades);
        resultados = [...resultados, ...mensualidades];
      }

      // Ordenar todos por fecha descendente (para mezclar servicios + mensualidades)
      resultados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      return resultados;
    } catch (error) {
      console.error('Error en obtenerIngresosDiarios:', error);
      throw error;
    }
  }

  /**
   * Obtiene resumen de ingresos diarios
   * @param {Object} filtros - Filtros para el resumen
   * @returns {Promise<Object>} Resumen con totales del día
   */
  static async obtenerResumenIngresosDiarios(filtros = {}) {
    const { tipo, tipoVehiculo, fecha } = filtros;

    try {
      let serviciosTotal = 0;
      let serviciosCantidad = 0;
      let mensualidadesTotal = 0;
      let mensualidadesCantidad = 0;

      // Total de servicios de hoy
      if (tipo === 'servicios' || tipo === 'todos') {
        let queryServicios = fecha
          ? 'SELECT COUNT(*) AS cantidad, COALESCE(SUM(costo), 0) AS total FROM servicios WHERE DATE(fecha_creacion) = ?'
          : 'SELECT COUNT(*) AS cantidad, COALESCE(SUM(costo), 0) AS total FROM servicios WHERE DATE(fecha_creacion) = CURDATE()';
        let paramsServicios = fecha ? [fecha] : [];

        if (tipoVehiculo && tipoVehiculo !== 'todos') {
          queryServicios += ' AND tipo_vehiculo = ?';
          paramsServicios.push(tipoVehiculo);
        }

        const [resumen] = await pool.query(queryServicios, paramsServicios);
        serviciosCantidad = resumen[0].cantidad;
        serviciosTotal = parseFloat(resumen[0].total);
      }

      // Total de mensualidades de hoy
      if (tipo === 'mensualidades' || tipo === 'todos') {
        let queryMensualidades = fecha
          ? 'SELECT COUNT(*) AS cantidad, COALESCE(SUM(valor_mensual), 0) AS total FROM mensualidades WHERE DATE(fecha_inicio) = ?'
          : 'SELECT COUNT(*) AS cantidad, COALESCE(SUM(valor_mensual), 0) AS total FROM mensualidades WHERE DATE(fecha_inicio) = CURDATE()';
        let paramsMensualidades = fecha ? [fecha] : [];

        if (tipoVehiculo && tipoVehiculo !== 'todos') {
          queryMensualidades += ' AND tipo_vehiculo = ?';
          paramsMensualidades.push(tipoVehiculo);
        }

        const [resumen] = await pool.query(queryMensualidades, paramsMensualidades);
        mensualidadesCantidad = resumen[0].cantidad;
        mensualidadesTotal = parseFloat(resumen[0].total);
      }

      return {
        servicios: {
          cantidad: serviciosCantidad,
          total: serviciosTotal
        },
        mensualidades: {
          cantidad: mensualidadesCantidad,
          total: mensualidadesTotal
        },
        totalGeneral: serviciosTotal + mensualidadesTotal
      };
    } catch (error) {
      console.error('Error en obtenerResumenIngresosDiarios:', error);
      throw error;
    }
  }
}

module.exports = Reporte;
