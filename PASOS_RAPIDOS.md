# 🆓 Despliegue Paso a Paso - Plan GRATUITO

## 📝 Lista de tareas en orden:

### 1. 🗄️ Base de Datos Externa (5 min)
**Elige UNA opción:**

#### Opción A: Supabase (Recomendado)
1. Ve a → https://supabase.com
2. Sign up/Login
3. "New project" → Elige nombre y contraseña
4. Espera 2-3 minutos a que se cree
5. Ve a Settings → Database → Connection string
6. Copia la URL completa

#### Opción B: Railway 
1. Ve a → https://railway.app
2. Sign up con GitHub
3. "New Project" → "Provision PostgreSQL"
4. Click en PostgreSQL → Variables → DATABASE_URL
5. Copia la URL

#### Opción C: Neon
1. Ve a → https://neon.tech
2. Sign up/Login
3. Create project
4. Dashboard → Connection string
5. Copia la URL

### 2. 🔧 Backend en Render (10 min)
1. Ve a → https://dashboard.render.com
2. "New" → "Web Service"
3. Connect GitHub → Busca tu repo "UTN-DS25-Grupo4"
4. Configuración:
   ```
   Name: canchaya-backend
   Runtime: Node
   Branch: main (o tu rama)
   Root Directory: backend
   Build Command: npm install && npm run build && npx prisma generate
   Start Command: npx prisma migrate deploy && npm start
   ```
5. Environment variables:
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=[tu-url-de-base-de-datos-del-paso-1]
   ```
6. "Create Web Service"
7. **GUARDAR URL**: ej. `https://canchaya-backend-abc123.onrender.com`

### 3. 🌐 Frontend en Render (5 min)
1. En Render Dashboard: "New" → "Static Site"
2. Mismo repo GitHub
3. Configuración:
   ```
   Name: canchaya-frontend  
   Branch: main
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```
4. Environment variables:
   ```
   VITE_API_URL=https://[tu-backend-url]/api
   VITE_APP_ENV=production
   ```
5. "Create Static Site"
6. **GUARDAR URL**: ej. `https://canchaya-frontend-xyz789.onrender.com`

### 4. 🔗 Conectar Frontend ↔ Backend (2 min)
1. Ve a tu backend en Render → Environment
2. Agrega variable:
   ```
   FRONTEND_URL=https://[tu-frontend-url]
   ```
3. Save Changes (se redesplegará automáticamente)

### 5. ✅ Verificar todo funcione
- Backend: https://tu-backend.onrender.com/api/health
- Frontend: https://tu-frontend.onrender.com

## 🕒 Tiempos de espera:
- **Primer deploy backend**: 5-10 minutos
- **Primer deploy frontend**: 2-5 minutos  
- **Despertar después de hibernar**: 30-60 segundos

## 💰 Costo total: $0/mes

## 🆘 Si algo falla:
1. Ve a Render → tu servicio → "Logs"
2. Busca errores en rojo
3. Verifica que las URLs estén bien escritas
4. Asegúrate de que la base de datos externa esté activa

## 📋 URLs que necesitas guardar:
- Base de datos: `postgresql://...`
- Backend: `https://tu-backend.onrender.com`
- Frontend: `https://tu-frontend.onrender.com`