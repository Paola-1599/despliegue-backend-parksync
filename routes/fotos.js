const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fotosController = require('../controllers/fotosController');
const { protegerRuta } = require('../middlewares/autenticacion');

// Configurar multer para guardar imágenes en disco
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads')); // Guardar en backend/uploads/
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const tipo = req.body.tipo || 'foto';
    const extension = path.extname(file.originalname);
    const filename = `${timestamp}_${tipo}${extension}`;
    cb(null, filename); // Ejemplo: 1704567890123_entrada_derecha.jpg
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo por imagen
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Solo se aceptan imágenes JPG o PNG'));
    }
  }
});

/**
 * POST /api/fotos/entrada
 * Recibir foto de entrada desde cámara DVR
 * Body: multipart/form-data con campos:
 *   - imagen: archivo de imagen (JPG)
 *   - tipo: entrada_derecha | entrada_izquierda | entrada_atras
 */
router.post('/entrada', upload.single('imagen'), fotosController.recibirFotosEntrada);

/**
 * GET /api/fotos/entrada/:servicioId
 * Obtener todas las fotos de entrada de un servicio (para PhotoGallery)
 * Requiere autenticación JWT
 */
router.get('/entrada/:servicioId', protegerRuta, fotosController.obtenerFotosEntrada);

/**
 * PUT /api/fotos/:fotoId/placa
 * Actualizar placa detectada (corrección del empleado)
 * Body JSON: { placaCorregida: 'ABC123' }
 */
router.put('/:fotoId/placa', protegerRuta, fotosController.actualizarPlacaDetectada);

/**
 * DELETE /api/fotos/:fotoId
 * Eliminar foto (si se rechaza)
 */
router.delete('/:fotoId', protegerRuta, fotosController.eliminarFoto);

module.exports = router;
