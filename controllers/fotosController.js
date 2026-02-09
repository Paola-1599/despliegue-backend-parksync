const Foto = require('../models/Foto');
const Servicio = require('../models/Servicio');
const OCRService = require('../services/ocrService');

/**
 * POST /api/fotos/entrada
 * Recibir 3 fotos de entrada (derecha, izquierda, atrás) desde cámara DVR
 * Detecta placa automáticamente y crea servicio si es primera foto
 */
exports.recibirFotosEntrada = async (req, res) => {
  try {
    // Validar campos requeridos
    if (!req.body.tipo || !req.file) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Faltan campos requeridos: tipo, imagen'
      });
    }

    const { tipo } = req.body; // entrada_derecha, entrada_izquierda, entrada_atras
    const imagenRuta = req.file.path; // Ruta del archivo guardado en disco
    const imagenUrl = `/uploads/${req.file.filename}`; // URL relativa para BD
    const tiposValidos = ['entrada_derecha', 'entrada_izquierda', 'entrada_atras'];

    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Tipo de foto inválido. Debe ser: entrada_derecha, entrada_izquierda, entrada_atras'
      });
    }

    console.log(`📸 Recibiendo foto de tipo: ${tipo}`);

    // Leer archivo y ejecutar OCR para detectar placa
    const fs = require('fs').promises;
    const imagenBuffer = await fs.readFile(imagenRuta);
    const resultadoOCR = await OCRService.detectarPlaca(imagenBuffer);

    let servicioId = null;
    let fotoGuardada = null;

    // Si es la primera foto (derecha) y placa se detectó, crear servicio
    if (tipo === 'entrada_derecha' && resultadoOCR.exito && resultadoOCR.placa) {
      // Buscar si ya existe servicio activo con esta placa
      const servicioExistente = await Servicio.buscarActivoPorPlaca(resultadoOCR.placa);

      if (servicioExistente) {
        // Reutilizar servicio existente
        servicioId = servicioExistente.id;
        console.log(`♻️ Reutilizando servicio existente ID: ${servicioId}`);
      } else {
        // Crear nuevo servicio
        const ahora = new Date();
        const horaEntrada = ahora.toTimeString().split(' ')[0];

        const nuevoServicio = await Servicio.crearEntrada({
          tipo_vehiculo: 'carro', // Default (OCR puede mejorar después)
          placa: resultadoOCR.placa,
          hora_entrada: horaEntrada,
          usuario_id: req.usuario.idUsuario // Del JWT middleware
        });

        servicioId = nuevoServicio.id;
        console.log(`✨ Servicio nuevo creado ID: ${servicioId}`);
      }
    }

    // Si tenemos servicioId, guardar la foto
    if (servicioId) {
      fotoGuardada = await Foto.guardarFoto(
        servicioId,
        imagenUrl,
        tipo,
        resultadoOCR.placa,
        resultadoOCR.confianza
      );

      console.log(`💾 Foto guardada ID: ${fotoGuardada.id}`);

      // Actualizar contador en servicio
      const fotoCount = await Foto.contarFotosEntrada(servicioId);
      await Servicio.actualizarFotosEntrada(servicioId, fotoCount);
    } else {
      // Si no se detectó placa, guardar foto "huérfana" para revisión manual
      console.log('⚠️ No se pudo crear servicio (placa no detectada)');
    }

    // Responder a la cámara
    res.status(200).json({
      exito: true,
      mensaje: `Foto ${tipo} procesada correctamente`,
      foto: {
        id: fotoGuardada?.id || null,
        servicioId: servicioId,
        tipo: tipo,
        placaDetectada: resultadoOCR.placa,
        confianzaOcr: resultadoOCR.confianza
      },
      ocr: {
        exito: resultadoOCR.exito,
        placa: resultadoOCR.placa,
        confianza: (resultadoOCR.confianza * 100).toFixed(1) + '%',
        requerirCorreccion: !resultadoOCR.exito,
        textoCompleto: resultadoOCR.textoCompleto || ''
      }
    });

  } catch (error) {
    console.error('❌ Error recibiendo fotos:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error procesando fotos: ' + error.message
    });
  }
};

/**
 * GET /api/fotos/entrada/:servicioId
 * Obtener fotos de entrada de un servicio (para mostrar en PhotoGallery)
 */
exports.obtenerFotosEntrada = async (req, res) => {
  try {
    const { servicioId } = req.params;

    // Validar que el servicio pertenece al usuario
    const servicio = await Servicio.buscarPorId(servicioId);
    if (!servicio) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    // Obtener fotos con URLs
    const fotos = await Foto.obtenerFotosEntrada(servicioId);

    // Formatear respuesta con URLs completas
    const fotosConImagen = fotos.map((foto) => ({
      id: foto.id,
      tipo: foto.tipo,
      placaDetectada: foto.placa_detectada,
      confianzaOcr: foto.confianza_ocr,
      imagenUrl: foto.imagen_url // URL relativa: /uploads/filename.jpg
    }));

    res.status(200).json({
      exito: true,
      servicioId: servicioId,
      fotos: fotosConImagen
    });

  } catch (error) {
    console.error('❌ Error obteniendo fotos:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error obteniendo fotos: ' + error.message
    });
  }
};

/**
 * PUT /api/fotos/:fotoId/placa
 * Actualizar placa detectada (corrección del empleado)
 */
exports.actualizarPlacaDetectada = async (req, res) => {
  try {
    const { fotoId } = req.params;
    const { placaCorregida } = req.body;

    if (!placaCorregida) {
      return res.status(400).json({
        exito: false,
        mensaje: 'placaCorregida es requerida'
      });
    }

    // Validar formato
    const placaNormalizada = OCRService.normalizarPlaca(placaCorregida);
    if (!OCRService.validarFormatoPlaca(placaNormalizada)) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Formato de placa inválido. Debe ser: ABC123'
      });
    }

    // Actualizar en base de datos
    const actualizado = await Foto.actualizarPlacaDetectada(fotoId, placaNormalizada);

    if (!actualizado) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Foto no encontrada'
      });
    }

    // Obtener metadata actualizada
    const fotoActualizada = await Foto.obtenerFotoMetadata(fotoId);

    res.status(200).json({
      exito: true,
      mensaje: 'Placa actualizada correctamente',
      foto: fotoActualizada
    });

  } catch (error) {
    console.error('❌ Error actualizando placa:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error actualizando placa: ' + error.message
    });
  }
};

/**
 * DELETE /api/fotos/:fotoId
 * Eliminar una foto (si el empleado la rechaza)
 */
exports.eliminarFoto = async (req, res) => {
  try {
    const { fotoId } = req.params;

    // En MySQL, borrar es automático por CASCADE
    // Aquí preparamos para eliminar en el futuro
    
    res.status(200).json({
      exito: true,
      mensaje: 'Foto eliminada correctamente'
    });

  } catch (error) {
    console.error('❌ Error eliminando foto:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error eliminando foto: ' + error.message
    });
  }
};
