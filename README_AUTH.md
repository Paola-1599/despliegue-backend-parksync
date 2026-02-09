# ParkSync Backend - Sistema de Autenticación

## 📋 Estructura de Archivos Creados

```
backend/
├── config/
│   └── db.js                          # Configuración de MySQL
├── controllers/
│   └── autenticacionController.js     # Lógica de autenticación
├── middlewares/
│   └── autenticacion.js               # Middleware de JWT
├── models/
│   └── Usuario.js                     # Modelo de usuario
├── routes/
│   └── autenticacion.js               # Rutas de auth
├── database/
│   └── schema.sql                     # Script de BD
├── .env                               # Variables de entorno
└── server.js                          # Servidor actualizado
```

## 🚀 Pasos para Configurar

### 1. Instalar Dependencias
```bash
cd backend
npm install mysql2 bcryptjs jsonwebtoken
```

### 2. Configurar Base de Datos
- Abre MySQL Workbench o tu cliente MySQL
- Ejecuta el archivo `database/schema.sql`
- Esto creará:
  - Base de datos `parksync`
  - Tabla `usuarios`
  - Usuario admin por defecto

### 3. Configurar Variables de Entorno
Edita el archivo `.env` con tus credenciales de MySQL:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=parksync
JWT_SECRET=cambiar_por_algo_seguro_en_produccion
```

### 4. Crear Usuario Admin
Ejecuta este script para crear el usuario administrador:
```javascript
const bcrypt = require('bcryptjs');
const password = await bcrypt.hash('Admin123', 10);
console.log(password); // Copia este hash al INSERT en schema.sql
```

### 5. Iniciar el Servidor
```bash
npm run dev
```

## 📡 Endpoints Disponibles

### POST /api/auth/login
Iniciar sesión
```json
{
  "correo": "admin@parksync.com",
  "contrasena": "Admin123"
}
```

### POST /api/auth/registro
Registrar nuevo usuario
```json
{
  "nombre": "Juan Pérez",
  "correo": "juan@example.com",
  "contrasena": "password123",
  "rol": "usuario"
}
```

### GET /api/auth/perfil
Obtener perfil (requiere token)
Header: `Authorization: Bearer <token>`

### GET /api/auth/verificar
Verificar token válido
Header: `Authorization: Bearer <token>`

## 🔐 Características de Seguridad

- ✅ Contraseñas encriptadas con bcrypt
- ✅ Tokens JWT con expiración
- ✅ Middleware de autenticación
- ✅ Verificación de roles
- ✅ Validación de datos
- ✅ Protección contra SQL injection
- ✅ CORS configurado

## 📝 Notas Importantes

1. Cambia `JWT_SECRET` en producción por algo más seguro
2. El usuario admin por defecto debe ser actualizado
3. La ruta de registro debería estar protegida en producción
4. Todos los archivos tienen nombres en español
5. Código completamente comentado
