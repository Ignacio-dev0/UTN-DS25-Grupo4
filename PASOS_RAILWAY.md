# 🚄 Pasos para Deploy en Railway

## 1. Crear Cuenta y Proyecto

1. **Ve a**: https://railway.app
2. **Regístrate** con tu cuenta de GitHub
3. **Crea nuevo proyecto** → "Deploy from GitHub repo"
4. **Selecciona** tu repositorio: `UTN-DS25-Grupo4`

## 2. Configurar Base de Datos

1. **En tu proyecto Railway** → Click "+" → "Database" → "PostgreSQL"
2. **Copia la DATABASE_URL** que se genera automáticamente
3. **Anota** la URL para usarla luego

## 3. Configurar Backend (API)

1. **En tu proyecto** → Click "+" → "GitHub Repo" 
2. **Configura** el servicio:
   - **Source**: `/backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`

3. **Variables de entorno**:
   ```
   DATABASE_URL = [URL automática de PostgreSQL]
   NODE_ENV = production
   JWT_SECRET = tu_jwt_secret_aqui
   FRONTEND_URL = [Dejar vacío por ahora]
   ```

4. **Deploy** → Esperar que termine

## 4. Configurar Frontend

1. **En tu proyecto** → Click "+" → "GitHub Repo"
2. **Configura** el servicio:
   - **Source**: `/frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview`

3. **Variables de entorno**:
   ```
   VITE_API_URL = [URL del backend]/api
   VITE_APP_ENV = production
   ```

## 5. Conectar Backend y Frontend

1. **Copia URL del backend** (ej: `https://backend-production-abc.railway.app`)
2. **Actualiza FRONTEND_URL** en backend con URL del frontend
3. **Actualiza VITE_API_URL** en frontend con URL del backend + `/api`
4. **Redeploy** ambos servicios

## 6. Migrar Base de Datos

1. **Ejecutar migraciones** en Railway:
   - Ve al backend → "Settings" → "Variables"
   - Agrega: `RAILWAY_RUN_MIGRATIONS = true`
   - Redeploy el backend

## URLs Finales Esperadas:
- **Backend**: `https://tu-backend.railway.app`
- **Frontend**: `https://tu-frontend.railway.app`
- **API**: `https://tu-backend.railway.app/api`

## Ventajas de Railway:
- ✅ **8GB RAM** (vs 512MB de Render)
- ✅ **$5 gratis** por mes
- ✅ **PostgreSQL incluido**
- ✅ **Deploy automático** desde GitHub
- ✅ **Sin límites de sleeps**