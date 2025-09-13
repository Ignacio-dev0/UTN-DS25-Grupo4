# Instrucciones para deployment en Railway

## Variables de entorno requeridas en Railway:

1. **DATABASE_URL**: Se configura automáticamente cuando conectas una base de datos PostgreSQL
2. **FRONTEND_URL**: URL de tu frontend (ej: https://canchaya.onrender.com)
3. **BASE_URL**: URL base de tu API de Railway (ej: https://utn-ds25-grupo4-canchaya.up.railway.app)
4. **NODE_ENV**: production

## Configuración en Railway Dashboard:

### Variables de entorno a agregar:
```
FRONTEND_URL=https://canchaya.onrender.com
BASE_URL=https://utn-ds25-grupo4-canchaya.up.railway.app
NODE_ENV=production
STATIC_FILES_PATH=/app/public/images
```

### Comandos importantes para Railway:

1. **Build Command**: `npm install && npm run build`
2. **Start Command**: `npm start` (ya configurado en railway.json)

### Endpoints de diagnóstico:

1. **Health Check**: `GET /api/health`
2. **Debug Images**: `GET /api/debug/images` 
3. **Test Image**: `GET /api/images/test.jpg`

### Estructura de directorios para imágenes:
```
/app/public/images/
├── usuarios/
├── complejos/
└── solicitudes/
```

### Notas importantes:

- Railway usa Nixpacks para el build automático
- El directorio público debe crearse durante el build
- Las imágenes se sirven desde `/api/images/`
- Los logs están mejorados para debugging

### Para debuggear errores 404 de imágenes:

1. Visita: `https://tu-app.up.railway.app/api/debug/images`
2. Revisa los logs en Railway Dashboard
3. Verifica que las variables de entorno estén configuradas