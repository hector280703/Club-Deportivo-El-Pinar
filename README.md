# Club Deportivo El Pinar - Sistema de Pagos

Sistema de gestión de pagos y administración de socios para el Club Deportivo El Pinar.

## 🎯 Características

- ✅ **Autenticación segura** con JWT
- ✅ **Gestión de socios** con múltiples series
- ✅ **Control de pagos** y estado de pago
- ✅ **Dashboard** con estadísticas
- ✅ **Reportes** de pagos por serie
- ✅ **Rutas protegidas** - Solo usuarios autenticados

## 🛠️ Stack Tecnológico

### Backend
- **Express.js** - Servidor web
- **Prisma** - ORM para base de datos
- **PostgreSQL** - Base de datos (en producción)
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas

### Frontend
- **React 18** - Interfaz de usuario
- **Vite** - Build tool
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Estilos

## 📦 Instalación Local

### Requisitos
- Node.js 18+
- npm o yarn

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/hector280703/Club-Deportivo-El-Pinar.git
cd Club-Deportivo-El-Pinar
```

2. **Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edita .env con tus configuraciones
npx prisma migrate dev  # Para SQLite (desarrollo local)
npm start
```

3. **Frontend** (en otra terminal)
```bash
cd frontend
npm install
npm run dev
```

4. **Acceder**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api

## 🔐 Credenciales Iniciales

```
Email: admin@elpinar.com
Contraseña: admin123
```

⚠️ **Cambiar estas credenciales después de la instalación**

## 🚀 Deployment

Para desplegar en Vercel con PostgreSQL:

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para instrucciones detalladas.

## 📁 Estructura del Proyecto

```
├── backend/
│   ├── src/
│   │   ├── index.js           # Entrada del servidor
│   │   ├── middleware/
│   │   │   └── auth.js        # Middleware de autenticación
│   │   └── routes/
│   │       ├── auth.js        # Login y verificación
│   │       ├── socios.js      # Gestión de socios
│   │       ├── pagos.js       # Gestión de pagos
│   │       ├── series.js      # Gestión de series
│   │       └── dashboard.js   # Estadísticas
│   └── prisma/
│       └── schema.prisma      # Esquema de BD
├── frontend/
│   ├── src/
│   │   ├── pages/             # Páginas
│   │   ├── components/        # Componentes
│   │   ├── context/           # Context API
│   │   ├── api/               # Cliente HTTP
│   │   └── App.jsx
│   └── vite.config.js
└── DEPLOYMENT.md              # Guía de deployment
```

## 🔒 Seguridad

- ✅ Autenticación JWT
- ✅ Rutas protegidas con ProtectedRoute
- ✅ Validación de tokens en servidor
- ✅ Credenciales no hardcodeadas
- ✅ CORS configurado
- ✅ Encriptación de contraseñas con bcrypt

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/verify` - Verificar token

### Socios
- `GET /api/socios` - Listar socios
- `POST /api/socios` - Crear socio
- `PUT /api/socios/:id` - Actualizar socio
- `DELETE /api/socios/:id` - Eliminar socio

### Pagos
- `GET /api/pagos` - Listar pagos
- `POST /api/pagos` - Registrar pago
- `PUT /api/pagos/:id` - Actualizar pago

### Series
- `GET /api/series` - Listar series
- `POST /api/series` - Crear serie

### Dashboard
- `GET /api/dashboard/stats` - Estadísticas

## 📝 Variables de Entorno

Ver [.env.example](./.env.example) para referencia.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 👨‍💻 Autor

Héctor López - [GitHub](https://github.com/hector280703)

---

**Última actualización:** Mayo 10, 2026
