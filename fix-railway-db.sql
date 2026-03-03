-- ============================================
-- SCRIPT PARA CORREGIR TABLAS EN RAILWAY
-- Ejecuta esto en tu base de datos de Railway
-- ============================================

-- Corregir tabla servicios
ALTER TABLE servicios 
MODIFY COLUMN id INT AUTO_INCREMENT;

-- Corregir tabla mensualidades
ALTER TABLE mensualidades 
MODIFY COLUMN id INT AUTO_INCREMENT;

-- Corregir tabla usuarios (por si acaso)
ALTER TABLE usuarios 
MODIFY COLUMN idUsuario INT AUTO_INCREMENT;

-- Corregir tabla configuraciones (por si acaso)
ALTER TABLE configuraciones 
MODIFY COLUMN id INT AUTO_INCREMENT;

-- Corregir tabla reportes (por si acaso)
ALTER TABLE reportes 
MODIFY COLUMN id INT AUTO_INCREMENT;

-- Corregir tabla fotos (por si acaso)
ALTER TABLE fotos 
MODIFY COLUMN id INT AUTO_INCREMENT;

-- Verificar que todo está correcto
SHOW COLUMNS FROM servicios WHERE Field = 'id';
SHOW COLUMNS FROM mensualidades WHERE Field = 'id';
