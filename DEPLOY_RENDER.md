# 🚀 Guía de Despliegue en Render - CanchaYa

Esta guía te ayudará a desplegar tanto el backend como el frontend de CanchaYa en Render.

## 📋 Prerrequisitos

1. Cuenta en [Render](https://render.com)
2. Repositorio en GitHub/GitLab
3. Código subido al repositorio remoto

## 🗄️ Opción 1: Despliegue Automático con render.yaml

### Paso 1: Configurar el archivo render.yaml
Ya tienes el archivo `render.yaml` en la raíz del proyecto. Este archivo define:
- Backend API (Node.js)
- Frontend estático (React)
- Base de datos PostgreSQL

### Paso 2: Subir cambios al repositorio
```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### Paso 3: Crear servicios en Render
1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Haz clic en "New" → "Blueprint"
3. Conecta tu repositorio de GitHub/GitLab
4. Render detectará automáticamente el `render.yaml`
5. Revisa la configuración y haz clic en "Apply"

## 🔧 Opción 2: Despliegue Manual

### A. Configurar Base de Datos

1. En Render Dashboard, haz clic en "New" → "PostgreSQL"
2. Configura:
   - **Name**: `canchaya-db`
   - **Database**: `canchaya`
   - **User**: `canchaya_user`
   - **Region**: Elige la más cercana a tus usuarios
3. Haz clic en "Create Database"
4. **Importante**: Guarda la URL de conexión que aparecerá

### B. Configurar Backend

1. En Render Dashboard, haz clic en "New" → "Web Service"
2. Conecta tu repositorio
3. Configura:
   - **Name**: `canchaya-backend`
   - **Runtime**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build && npx prisma generate`
   - **Start Command**: `cd backend && npx prisma migrate deploy && npm start`
   - **Root Directory**: `./`

4. **Variables de Entorno**:
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=[URL de tu base de datos PostgreSQL]
   FRONTEND_URL=https://[tu-frontend].onrender.com
   ```

5. Haz clic en "Create Web Service"

### C. Configurar Frontend

1. En Render Dashboard, haz clic en "New" → "Static Site"
2. Conecta tu repositorio
3. Configura:
   - **Name**: `canchaya-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Root Directory**: `./`

4. **Variables de Entorno**:
   ```
   VITE_API_URL=https://[tu-backend].onrender.com/api
   VITE_APP_ENV=production
   ```

5. Haz clic en "Create Static Site"

## 🔄 Actualizar URLs

### Actualizar Frontend para apuntar al Backend
1. Ve a tu servicio frontend en Render
2. En "Environment", actualiza:
   ```
   VITE_API_URL=https://canchaya-backend.onrender.com/api
   ```

### Actualizar Backend para permitir Frontend
1. Ve a tu servicio backend en Render
2. En "Environment", actualiza:
   ```
   FRONTEND_URL=https://canchaya-frontend.onrender.com
   ```

## 🎯 URLs Finales

Después del despliegue tendrás:
- **Frontend**: `https://canchaya-frontend.onrender.com`
- **Backend API**: `https://canchaya-backend.onrender.com/api`
- **Health Check**: `https://canchaya-backend.onrender.com/api/health`

## 🔍 Verificación

### Backend
1. Ve a: `https://canchaya-backend.onrender.com/api/health`
2. Deberías ver: `{"status":"OK","timestamp":"...","service":"CanchaYa Backend API"}`

### Frontend
1. Ve a: `https://canchaya-frontend.onrender.com`
2. La aplicación React debería cargar correctamente

## ⚠️ Consideraciones Importantes

### Base de Datos
- Render proporciona 1GB gratis para PostgreSQL
- Las migraciones se ejecutan automáticamente en cada despliegue
- **No ejecutes `prisma migrate reset` en producción**

### Rendimiento
- Los servicios gratuitos de Render se "duermen" después de 15 minutos de inactividad
- Primera carga después del "sueño" puede tomar 30-60 segundos
- Considera un plan pago para apps de producción

### Logs
- Ve a tu servicio en Render → "Logs" para debug
- Los logs muestran build, start y runtime errors

### Dominio Personalizado (Opcional)
1. Ve a tu servicio → "Settings" → "Custom Domains"
2. Agrega tu dominio
3. Configura DNS según las instrucciones

## 🚨 Solución de Problemas

### Error en Build del Backend
```bash
# Verificar dependencias localmente
cd backend
npm install
npm run build
```

### Error en Build del Frontend
```bash
# Verificar dependencias localmente
cd frontend
npm install
npm run build
```

### Error de Base de Datos
1. Verifica que `DATABASE_URL` esté configurada correctamente
2. Revisa logs del backend para errores de conexión
3. Asegúrate de que las migraciones sean compatibles

### Error de CORS
1. Verifica que `FRONTEND_URL` esté configurada en el backend
2. Actualiza la configuración de CORS en `app.ts` si es necesario

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Render Dashboard
2. Verifica las variables de entorno
3. Prueba el build localmente primero
4. Contacta al equipo de desarrollo

---

**✨ ¡Tu aplicación CanchaYa está lista para producción!**