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

1. **PROBLEMA CRÍTICO ENCONTRADO**: Las migraciones estaban en `.gitignore`
   - Archivo: `backend/.gitignore` tenía `prisma/migrations/`
   - **SOLUCIÓN**: Remover esa línea y hacer commit de las migraciones

2. **Ejecutar migraciones** en Railway:
   - ✅ `RAILWAY_RUN_MIGRATIONS = true` configurado
   - ✅ Migraciones agregadas al repositorio
   - 🔄 Esperando deploy para aplicar cambios

## 🚨 **ESTADO FINAL DEL DEPLOYMENT** (Sep 12, 2025)

### 🎉 **DEPLOYMENT EXITOSO - BACKEND FUNCIONANDO:**
- **Backend desplegado**: `https://utn-ds25-grupo4-canchaya.up.railway.app` ✅
- **Base de datos PostgreSQL**: Funcionando ✅  
- **Health Check**: Responde correctamente ✅
- **Variables de entorno**: DATABASE_URL configurada ✅
- **Migraciones ejecutadas**: Todas las 11 migraciones aplicadas ✅
- **API Endpoints**: Funcionando correctamente ✅
- **Tablas de BD**: Creadas exitosamente ✅

### ✅ **PROBLEMAS RESUELTOS:**
- **DATABASE_URL**: Configurada en el servicio backend
- **Migraciones**: Se ejecutaron correctamente después del redeploy
- **Conexión BD**: Prisma conectado y funcionando
- **Endpoints**: API respondiendo correctamente

### 🔧 **SOLUCIÓN REQUERIDA:**

**OPCIÓN A: Dashboard Web (RECOMENDADO)**
1. **Ir a**: https://railway.app/dashboard
2. **Proyecto**: "clever-wisdom" → Servicio "back"
3. **Settings** → **Source** → "Trigger Deploy"
4. **O eliminar** y recrear el servicio backend

**OPCIÓN B: Recrear Servicios**
1. **Eliminar** servicio "back" actual
2. **Crear nuevo** servicio desde GitHub
3. **Configurar** variables de entorno nuevamente
4. **Las migraciones** se ejecutarán en el primer deploy

### � **ARCHIVOS IMPORTANTES CREADOS:**
- ✅ `backend/.gitignore` - Removido `prisma/migrations/`
- ✅ `backend/prisma/migrations/*` - 11 archivos de migración
- ✅ `backend/create_tables.sql` - SQL directo de emergencia
- ✅ `backend/src/app.ts` - Endpoints de migración manual

### 🎯 **SIGUIENTE PASO CRÍTICO:**
**Acceder al dashboard web de Railway y forzar un deploy completo o recrear el servicio backend.**

---

## ⚠️ **FRONTEND STATUS:**
- **URL**: `https://front-canchaya.up.railway.app`
- **Estado**: Error 403 - Vite preview host blocking
- **Problema**: Vite preview no permite el host de Railway
- **Variables**: VITE_API_URL configurada correctamente ✅
- **Archivos modificados**: 
  - `package.json` - Script preview con --host --port 4173
  - `vite.config.js` - allowedHosts configurado

### 🚨 **FRONTEND REQUIERE:**
1. **Cambiar a build estático** en lugar de preview
2. **Usar serve** o **nginx** para servir archivos
3. **O configurar proxy** correctamente

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