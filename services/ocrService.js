const Tesseract = require('tesseract.js');
const sharp = require('sharp');

class OCRService {
  /**
   * Detectar placa de imagen
   * @param {Buffer} imagenBuffer - Buffer de imagen JPG
   * @returns {Promise<Object>} { placa: 'ABC123', confianza: 0.87, texto_completo: '...' }
   */
  static async detectarPlaca(imagenBuffer) {
    try {
      console.log('🔍 Iniciando OCR en imagen...');

      const buildPreprocessedBuffers = async (buffer) => {
        const base = await sharp(buffer)
          .resize({ width: 1200, withoutEnlargement: true })
          .grayscale()
          .normalize()
          .threshold(180)
          .png()
          .toBuffer();

        const buffers = [base];

        try {
          const meta = await sharp(buffer).metadata();
          if (meta.width && meta.height) {
            const crops = [
              { left: 0.2, top: 0.55, width: 0.6, height: 0.25 },
              { left: 0.15, top: 0.45, width: 0.7, height: 0.3 },
              { left: 0.1, top: 0.65, width: 0.8, height: 0.25 }
            ];

            for (const cropSpec of crops) {
              const left = Math.floor(meta.width * cropSpec.left);
              const top = Math.floor(meta.height * cropSpec.top);
              const width = Math.floor(meta.width * cropSpec.width);
              const height = Math.floor(meta.height * cropSpec.height);

              if (width > 0 && height > 0) {
                const crop = await sharp(buffer)
                  .extract({ left, top, width, height })
                  .resize({ width: 1200, withoutEnlargement: true })
                  .grayscale()
                  .normalize()
                  .threshold(180)
                  .png()
                  .toBuffer();
                buffers.unshift(crop);
              }
            }
          }
        } catch (err) {
          console.warn('⚠️ No se pudo generar recorte para OCR:', err.message);
        }

        return buffers;
      };

      const runOcr = async (buffer, psm) => {
        const imagenBase64 = 'data:image/png;base64,' + buffer.toString('base64');
        const result = await Tesseract.recognize(imagenBase64, 'eng', {
          logger: (m) => {
            if (m.progress !== undefined) {
              console.log(`OCR Progress: ${(m.progress * 100).toFixed(0)}%`);
            }
          },
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789- ',
          tessedit_pageseg_mode: String(psm)
        });
        return result;
      };

      const buffers = await buildPreprocessedBuffers(imagenBuffer);
      const psms = [7, 6, 11];
      let ultimoTexto = '';

      for (let i = 0; i < buffers.length; i++) {
        for (const psm of psms) {
          const result = await runOcr(buffers[i], psm);
          const texto = result.data.text || '';
          console.log(`📝 Texto OCR detectado (buffer ${i + 1}, PSM${psm}):`, texto);

          if (texto) {
            ultimoTexto = texto;
          }

          const placaMatch = texto.match(/([A-Z]{3}\s*[-]?\s*[0-9]{3})/i);
          if (placaMatch && placaMatch[1]) {
            const placaLimpia = OCRService.normalizarPlaca(placaMatch[1]);
            if (!OCRService.validarFormatoPlaca(placaLimpia)) {
              console.log('⚠️ Placa detectada no cumple el formato esperado');
              continue;
            }

            const confianza = result.data.confidence / 100;
            console.log(`✅ Placa detectada: ${placaLimpia} (Confianza: ${(confianza * 100).toFixed(1)}%)`);

            return {
              exito: true,
              placa: placaLimpia,
              confianza: Math.min(confianza, 1),
              textoCompleto: texto,
              mensaje: 'Placa detectada correctamente'
            };
          }
        }
      }

      console.log('⚠️ No se detectó placa en formato esperado');

      return {
        exito: false,
        placa: null,
        confianza: 0,
        textoCompleto: ultimoTexto,
        mensaje: 'No se detectó placa. Texto encontrado: ' + ultimoTexto,
        requerirCorreccion: true
      };
    } catch (error) {
      console.error('❌ Error en OCR:', error.message);

      return {
        exito: false,
        placa: null,
        confianza: 0,
        textoCompleto: null,
        mensaje: 'Error procesando imagen: ' + error.message,
        requerirCorreccion: true
      };
    }
  }

  /**
   * Detectar tipo de vehículo por análisis de imagen (opcional)
   * Retorna 'carro' o 'moto' basado en análisis simple
   * @param {Buffer} imagenBuffer - Buffer de imagen
   * @returns {Promise<string>} 'carro' o 'moto'
   */
  static async detectarTipoVehiculo(imagenBuffer) {
    try {
      console.log('🚗 Analizando tipo de vehículo...');

      // Para versión v1: retornar 'carro' por defecto
      // En v2: usar visión por computadora avanzada
      
      // Por ahora, confiamos en que el empleado selecciona el tipo
      // y OCR solo se encarga de la placa
      
      return 'carro'; // Default
    } catch (error) {
      console.error('Error detectando tipo:', error);
      return 'carro'; // Default fallback
    }
  }

  /**
   * Validar formato de placa colombiana
   * @param {string} placa - Placa a validar
   * @returns {boolean}
   */
  static validarFormatoPlaca(placa) {
    // Patrón: 3 letras + 3 números
    const patronPlaca = /^[A-Z]{3}[0-9]{3}$/;
    return patronPlaca.test(placa);
  }

  /**
   * Normalizar placa (eliminar espacios, convertir a mayúsculas)
   * @param {string} placa - Placa a normalizar
   * @returns {string}
   */
  static normalizarPlaca(placa) {
    return placa
      .toUpperCase()
      .replace(/[-\s]/g, '') // Eliminar guiones y espacios
      .trim();
  }
}

module.exports = OCRService;
