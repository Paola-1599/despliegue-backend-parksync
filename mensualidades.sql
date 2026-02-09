-- Tabla de Mensualidades/Membresías
CREATE TABLE IF NOT EXISTS mensualidades (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre_completo VARCHAR(150) NOT NULL,
  tipo_documento VARCHAR(20) NOT NULL,
  numero_documento VARCHAR(50) NOT NULL UNIQUE,
  telefono VARCHAR(20) NOT NULL,
  correo VARCHAR(100) NOT NULL,
  placa VARCHAR(10) NOT NULL,
  tipo_vehiculo VARCHAR(50) NOT NULL,
  marca VARCHAR(50) NOT NULL,
  color VARCHAR(50) NOT NULL,
  es_24_7 TINYINT(1) DEFAULT 0,
  fecha_inicio DATE NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  valor_mensual DECIMAL(12, 2) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'activo',
  usuario_id INT NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(idUsuario) ON DELETE CASCADE,
  INDEX (numero_documento),
  INDEX (placa),
  INDEX (fecha_vencimiento),
  INDEX (estado),
  INDEX (usuario_id)
);
