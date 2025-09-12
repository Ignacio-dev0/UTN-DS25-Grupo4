# 🚄 Pasos para Deploy en Railway

## 1. Crear Cuenta y Proyecto

1. **Ve a**: https://railway.app
2. **Regístrate** con tu cuenta de GitHub
3. **Crea nuevo proyecto** → "Deploy from GitHub repo"
4. **Selecciona** tu repositorio: `UTN-DS25-Grupo4`

### ⚠️ **IMPORTANTE: Configurar Rama Específica**

**Después de conectar el repo**:
1. **Ve a Settings** del proyecto
2. **En "Source"** → Click "Configure"
3. **Branch**: Cambia de `main` a `thiagoperez`
4. **Root Directory**: Déjalo en `/` (raíz)
5. **Save Changes**

O **alternativamente**, cuando crees cada servicio:
- En **Backend**: Root Directory = `/backend`, Branch = `thiagoperez`
- En **Frontend**: Root Directory = `/frontend`, Branch = `thiagoperez`

## 2. Configurar Base de Datos

1. **En tu proyecto Railway** → Click "+" → "Database" → "PostgreSQL"
2. **Copia la DATABASE_URL** que se genera automáticamente
3. **Anota** la URL para usarla luego

## 3. Configurar Backend (API)

1. **En tu proyecto** → Click "+" → "GitHub Repo" 
2. **Selecciona** el mismo repositorio: `UTN-DS25-Grupo4`
3. **Configura** el servicio:
   - **Branch**: `thiagoperez` ⚠️ **IMPORTANTE**
   - **Source**: `/backend` (Root Directory)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`

4. **Variables de entorno**:
   ```
   DATABASE_URL = [URL automática de PostgreSQL]
   NODE_ENV = production
   JWT_SECRET = tu_jwt_secret_aqui
   FRONTEND_URL = [Dejar vacío por ahora]
   ```

5. **Deploy** → Esperar que termine

## 4. Configurar Frontend

1. **En tu proyecto** → Click "+" → "GitHub Repo"
2. **Selecciona** el mismo repositorio: `UTN-DS25-Grupo4`
3. **Configura** el servicio:
   - **Branch**: `thiagoperez` ⚠️ **IMPORTANTE**
   - **Source**: `/frontend` (Root Directory)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview`

4. **Variables de entorno**:
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

---

## 🔧 **Configuración de Rama Específica**

### Método 1: En Settings del Proyecto
1. **Después de crear el proyecto** → Ve a "Settings"
2. **Source** → "Configure"
3. **Branch**: Cambia a `thiagoperez`
4. **Save**

### Método 2: Al Crear Cada Servicio
- Cuando agregues **Backend** o **Frontend**
- En el formulario de configuración:
  - **Repository**: `UTN-DS25-Grupo4`
  - **Branch**: `thiagoperez` ⚠️
  - **Root Directory**: `/backend` o `/frontend`

### Verificar Configuración
- En cada servicio → **Settings** → **Source**
- Debe mostrar: `thiagoperez` branch
- Root Directory: `/backend` o `/frontend`