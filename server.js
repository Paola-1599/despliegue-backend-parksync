/**
 * Servidor Principal de ParkSync
 * Sistema de Gestión de Estacionamiento
 * 
 * @author ParkSync Team
 * @version 1.0.0
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
require('dotenv').config({ override: true });
const { verificarConexion } = require('./config/db');

const app = express();

// ============================================
// MIDDLEWARES
// ============================================

// CORS - Permitir peticiones desde el frontend
app.use(cors({
  origin: 'true', // Permitir todas las fuentes (puede ser restringido a dominios específicos)
  credentials: true 
  
}));

// Parser de JSON
app.use(express.json());

// Parser de datos URL-encoded
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging de peticiones en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// RUTAS
// ============================================

// Ruta raíz - Health check
app.get("/", (req, res) => {
  res.json({
    mensaje: "API ParkSync funcionando correctamente 🚀",
    version: "1.0.0",
    estado: "activo"
  });
});

// Rutas de autenticación
const rutasAutenticacion = require('./routes/autenticacion');
app.use('/api/auth', rutasAutenticacion);

// Rutas de servicios de parqueadero
const rutasServicios = require('./routes/servicios');
app.use('/api/servicios', rutasServicios);

// Rutas de mensualidades
const rutasMensualidades = require('./routes/mensualidades');
app.use('/api/mensualidades', rutasMensualidades);

// Rutas de fotos (cámara + OCR)
const rutasFotos = require('./routes/fotos');
app.use('/api/fotos', rutasFotos);

// Rutas de configuración (tarifas)
const rutasConfiguracion = require('./routes/configuracion');
app.use('/api/configuraciones', rutasConfiguracion);

// Rutas de reportes
const rutasReportes = require('./routes/reportes');
app.use('/api/reportes', rutasReportes);

// Ruta 404 - No encontrada
app.use((req, res) => {
  res.status(404).json({
    exito: false,
    mensaje: "Ruta no encontrada"
  });
});

// ============================================
// MANEJO DE ERRORES GLOBAL
// ============================================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    exito: false,
    mensaje: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================
const PORT = process.env.PORT || 5000;

const iniciarServidor = async () => {
  try {
    // Verificar conexión a la base de datos
    const conexionExitosa = await verificarConexion();
    
    if (!conexionExitosa) {
      console.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }

    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`🚀 Servidor ParkSync iniciado correctamente`);
      console.log(`📍 Puerto: ${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

iniciarServidor();