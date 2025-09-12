# 🔧 Solución de Problemas - Render Deploy

## ❌ Error: "Could not find a declaration file for module 'cors'"

### Problema:
```
error TS7016: Could not find a declaration file for module 'cors'
error TS7016: Could not find a declaration file for module 'bcrypt'
```

## ✅ Solución FINAL implementada:

**Build Command**:
```
npm install --production=false && npx prisma generate && npm run build
```

**Start Command**:
```
npx prisma generate && npx prisma migrate deploy && npm start
```

**Imports de Prisma**: Todos usando `@prisma/client` (estándar)

### 🔄 Comando de Build actualizado:
```
npm install --production=false && npm run build && npx prisma generate
```

El flag `--production=false` asegura que se instalen TODAS las dependencias incluidos los tipos.

## ❌ Error: "Build failed" en Render

### Verificar localmente:
```bash
cd backend
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

Si funciona localmente pero falla en Render:

1. **Ve a tu servicio en Render → Settings**
2. **Build Command**: 
   ```
   npm install --production=false && npm run build && npx prisma generate
   ```
3. **Start Command**:
   ```
   npx prisma migrate deploy && npm start
   ```

## ❌ Error: "Database connection"

### Verificar DATABASE_URL:
1. Ve a Render → tu backend → Environment
2. Verifica que `DATABASE_URL` sea correcta
3. Formato esperado:
   ```
   postgresql://usuario:password@host:5432/database
   ```

### Probar conexión a DB externa:
Si usas Supabase/Railway/Neon, verifica que:
- La base de datos esté activa
- Las credenciales sean correctas
- El host sea accesible

## ❌ Error: "Port already in use"

### En Render:
No cambies el PORT, Render maneja esto automáticamente.

Variables correctas:
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://...
FRONTEND_URL=https://tu-frontend.onrender.com
```

## ❌ Error: "CORS policy"

### Verificar configuración:
1. Backend debe tener `FRONTEND_URL` configurada
2. Frontend debe usar la URL correcta del backend

### En el código (app.ts):
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

## ❌ Frontend no conecta con Backend

### Verificar URLs:
1. **Frontend**: `VITE_API_URL=https://tu-backend.onrender.com/api`
2. **Backend**: `FRONTEND_URL=https://tu-frontend.onrender.com`

### Verificar que backend esté activo:
- Ve a: `https://tu-backend.onrender.com/api/health`
- Debe responder: `{"status":"OK",...}`

## ❌ "Service sleeping" (Plan gratuito)

### Esperado:
- Servicios se duermen después de 15 min sin uso
- Primera carga toma 30-60 segundos

### Para mantener activo (opcional):
Crear ping automático con GitHub Actions:

`.github/workflows/keep-alive.yml`:
```yaml
name: Keep Alive
on:
  schedule:
    - cron: '*/14 * * * *' # Cada 14 minutos
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping services
        run: |
          curl https://tu-backend.onrender.com/api/health
          curl https://tu-frontend.onrender.com
```

## 🚨 Si NADA funciona:

### Resetear todo:
1. **Eliminar servicios en Render**
2. **Verificar build local**:
   ```bash
   ./prepare-deploy.sh
   ```
3. **Subir cambios**:
   ```bash
   git add .
   git commit -m "Fix build issues"
   git push origin main
   ```
4. **Recrear servicios siguiendo PASOS_RAPIDOS.md**

### Logs útiles:
- **Render**: Dashboard → tu servicio → "Logs"
- **Local**: Terminal donde corres `npm run build`

### Contacto:
Si sigues teniendo problemas, comparte:
1. Logs de Render (captura de pantalla)
2. Resultado de `npm run build` local
3. Variables de entorno configuradas (sin passwords)