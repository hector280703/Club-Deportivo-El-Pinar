# Guía de Deployment - Club Deportivo El Pinar

## 📋 Requisitos Previos

- Cuenta en [Neon](https://console.neon.tech) (PostgreSQL gratis)
- Cuenta en [Vercel](https://vercel.com)
- Tu repositorio GitHub conectado

---

## 🔧 Paso 1: Configurar PostgreSQL en Neon

1. Ve a https://console.neon.tech
2. Crea un nuevo proyecto (ej: "el-pinar")
3. Elige PostgreSQL como base de datos
4. Copia la **Connection String** en formato `psql://...`
5. Guarda esta URL, la necesitarás en Vercel

### Migrar datos de SQLite a PostgreSQL (opcional)

Si quieres mantener tus datos actuales:

```bash
# En tu máquina local, instala Prisma CLI
npm install -g prisma

# Migra el schema
npx prisma migrate deploy

# Seed con datos iniciales
npx prisma db seed
```

---

## 🚀 Paso 2: Desplegar en Vercel

### Opción A: Desde GitHub (Recomendado)

1. Ve a https://vercel.com/new
2. Importa tu repositorio GitHub: `https://github.com/hector280703/Club-Deportivo-El-Pinar`
3. Vercel detectará automáticamente tu monorepo
4. **Configura las variables de entorno:**
   - `DATABASE_URL` → La URL de Neon que copiaste
   - `JWT_SECRET` → Genera una cadena aleatoria segura
   - `NODE_ENV` → `production`
   - `FRONTEND_URL` → `https://tu-proyecto.vercel.app`

5. Haz clic en **Deploy**
6. Espera a que termine (2-3 minutos)

### Opción B: CLI de Vercel

```bash
# Instala Vercel CLI
npm i -g vercel

# Autentica
vercel login

# Despliega
vercel --prod
```

---

## 📱 Paso 3: Verificar el Deployment

Después de desplegar:

1. Ve a tu URL de Vercel: `https://tu-proyecto.vercel.app`
2. Intenta acceder a `/login`
3. Prueba con credenciales: `admin@elpinar.com` / `admin123`
4. Accede a rutas protegidas: `/socios`, `/pagos`, etc.

---

## 🔐 Variables de Entorno Necesarias

En Vercel, agrega estas variables en **Settings > Environment Variables:**

```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=your-super-secret-key-generate-new-one
NODE_ENV=production
FRONTEND_URL=https://tu-proyecto.vercel.app
```

---

## 📊 Validar Conexión a Base de Datos

Ejecuta este comando localmente para verificar:

```bash
npx prisma db push
```

Si funciona, tu base de datos está correctamente configurada.

---

## 🐛 Solucionar Problemas

### "Database connection failed"
- Verifica que la URL de Neon es correcta
- Asegúrate de que el `sslmode=require` está en la URL

### "Function execution timeout"
- Verifica que tu JWT_SECRET no es muy largo
- Los requests a la API pueden tardar máximo 60 segundos

### "Module not found"
- Ejecuta `npm install` en ambas carpetas (backend y frontend)
- Asegúrate que `backend/package.json` incluya todas las dependencias

---

## 📝 Estructura Final

```
Club-Deportivo-El-Pinar/
├── backend/                    # Backend Express (serverless en Vercel)
│   ├── src/
│   ├── prisma/                # Migraciones y schema
│   └── package.json
├── frontend/                   # Frontend React (SPA en Vercel)
│   ├── src/
│   ├── .env.local             # Dev: localhost:3001
│   ├── .env.production        # Prod: /api (mismo dominio)
│   └── package.json
├── api/                        # Serverless functions para Vercel
│   └── index.js
├── vercel.json                # Configuración de Vercel
├── .env.example               # Ejemplo de variables
└── .gitignore                 # Ya configurado
```

---

## 🎯 URL Final

Después del deployment:
- **Frontend:** https://tu-proyecto.vercel.app
- **API:** https://tu-proyecto.vercel.app/api

¡Listo! 🎉

