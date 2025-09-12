# 🚀 Guía de Despliegue GRATUITO en Render - CanchaYa

Esta guía te ayudará a desplegar el backend y frontend de CanchaYa por separado usando el **plan gratuito** de Render.

## 📋 Prerrequisitos

1. Cuenta **gratuita** en [Render](https://render.com)
2. Repositorio en GitHub (público para plan gratuito)
3. Código subido al repositorio remoto

## 🗄️ Paso 1: Configurar Base de Datos (Opcional - External DB)

**Para plan gratuito necesitas usar una base de datos externa gratuita:**

### Opción A: Supabase (Recomendado)
1. Ve a [Supabase](https://supabase.com) y crea cuenta gratuita
2. Crea nuevo proyecto
3. Ve a Settings → Database → Connection string
4. Copia la URL que se ve así: `postgresql://user:password@host:5432/database`

### Opción B: Railway
1. Ve a [Railway](https://railway.app) y crea cuenta gratuita
2. New Project → Provision PostgreSQL
3. Variables → DATABASE_URL

### Opción C: Neon
1. Ve a [Neon](https://neon.tech) y crea cuenta gratuita
2. Crea base de datos
3. Copia connection string

## 🔧 Paso 2: Desplegar Backend

1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Haz clic en **"New"** → **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Configura:

### Configuración Básica:
- **Name**: `canchaya-backend` (o el nombre que prefieras)
- **Runtime**: `Node`
- **Branch**: `main` (o tu rama principal)
- **Root Directory**: `backend`
- **Build Command**: `npm install --production=false && npm run build && npx prisma generate`
- **Start Command**: `npx prisma migrate deploy && npm start`

### Variables de Entorno (Environment):
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://tu-usuario:tu-password@tu-host:5432/tu-database
```

5. Haz clic en **"Create Web Service"**
6. **Importante**: Guarda la URL que te da (ej: `https://canchaya-backend.onrender.com`)

## 🌐 Paso 3: Desplegar Frontend

1. En Render Dashboard, haz clic en **"New"** → **"Static Site"**
2. Conecta tu repositorio (el mismo)
3. Configura:

### Configuración Básica:
- **Name**: `canchaya-frontend`
- **Branch**: `main`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

### Variables de Entorno (Environment):
```
VITE_API_URL=https://canchaya-backend.onrender.com/api
VITE_APP_ENV=production
```

4. Haz clic en **"Create Static Site"**

## 🔄 Paso 4: Conectar Frontend con Backend

### Actualizar CORS en Backend
1. Ve a tu servicio backend en Render
2. Ve a "Environment" y agrega:
```
FRONTEND_URL=https://canchaya-frontend.onrender.com
```
3. Haz clic en "Save Changes" (esto redesplegará automáticamente)

### Verificar conexión en Frontend
- El frontend ya debería estar conectado con `VITE_API_URL`

## 🎯 URLs Finales (Ejemplos)

- **Frontend**: `https://canchaya-frontend.onrender.com`
- **Backend API**: `https://canchaya-backend.onrender.com/api`
- **Health Check**: `https://canchaya-backend.onrender.com/api/health`

## 🔍 Verificación

### 1. Verificar Backend
```bash
curl https://canchaya-backend.onrender.com/api/health
# Debería responder: {"status":"OK","timestamp":"...","service":"CanchaYa Backend API"}
```

### 2. Verificar Frontend
- Abre tu URL del frontend
- Debería cargar la aplicación React
- Verifica en DevTools → Network que las llamadas a la API funcionen

## ⚠️ Limitaciones del Plan Gratuito

### 🕒 Hibernación
- Los servicios se "duermen" después de **15 minutos** sin actividad
- Primera carga después del sueño: **30-60 segundos**
- **Solución**: Usar un servicio ping cada 10-14 minutos

### 📊 Recursos
- **750 horas/mes** por servicio (más que suficiente)
- **CPU/RAM limitados** (adecuado para desarrollo/demos)
- **Repositorio público** requerido

### 🗄️ Base de Datos
- Render no incluye PostgreSQL gratuito
- **Usar servicios externos** como Supabase/Railway/Neon

## 🚨 Solución de Problemas

### ❌ Error "Build failed"
```bash
# Probar localmente
cd backend
npm install
npm run build

cd ../frontend  
npm install
npm run build
```

### ❌ Error de conexión a DB
1. Verifica que `DATABASE_URL` sea correcta
2. Asegúrate de que la DB externa esté activa
3. Revisa logs: Render Dashboard → tu servicio → "Logs"

### ❌ Error de CORS
```
Access to fetch at 'backend-url' from origin 'frontend-url' has been blocked
```
**Solución**: Verificar que `FRONTEND_URL` esté configurada en el backend

### ❌ Frontend no conecta con Backend
1. Verifica `VITE_API_URL` en frontend
2. Asegúrate de que ambos servicios estén desplegados
3. Espera a que el backend "despierte" si estaba dormido

## 🚀 Script de Ping (Opcional)

Para evitar que tus servicios se duerman, puedes usar:

### GitHub Actions (Gratis)
Crea `.github/workflows/keep-alive.yml`:
```yaml
name: Keep Alive
on:
  schedule:
    - cron: '*/10 * * * *' # Cada 10 minutos
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Backend
        run: curl https://tu-backend.onrender.com/api/health
      - name: Ping Frontend  
        run: curl https://tu-frontend.onrender.com
```

## 📞 Costos ($0)

✅ **Backend Web Service**: Gratuito (750h/mes)  
✅ **Frontend Static Site**: Gratuito (100GB/mes)  
✅ **Base de datos externa**: Gratuito (Supabase/Railway/Neon)  
✅ **GitHub Actions**: Gratuito (2000 min/mes)

**Total: $0/mes** 🎉

## 📋 Checklist Final

- [ ] Base de datos externa configurada
- [ ] Backend desplegado con `DATABASE_URL`
- [ ] Frontend desplegado con `VITE_API_URL`
- [ ] CORS configurado (`FRONTEND_URL` en backend)
- [ ] Health check funcionando
- [ ] Frontend se conecta al backend
- [ ] (Opcional) Ping configurado

---

**✨ ¡Tu aplicación CanchaYa está desplegada GRATIS!**

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