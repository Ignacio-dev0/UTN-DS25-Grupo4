# Railway Deployment Configuration

Railway es una plataforma de deployment moderna que ofrece:
- **8GB RAM** en plan gratuito (vs 512MB de Render)
- **$5 de crédito mensual** gratis
- **Deploy automático** desde GitHub
- **PostgreSQL integrado**

## Estructura de Deployment

### Backend (API)
- **Plataforma**: Railway
- **Runtime**: Node.js 18+
- **Base de datos**: PostgreSQL (Railway)
- **Puerto**: Dinámico (Railway lo asigna)

### Frontend (React)
- **Plataforma**: Railway Static Sites
- **Build**: Vite
- **Serving**: Estático

## Variables de Entorno Necesarias

### Backend (`backend/.env`)
```env
# Base de datos (Railway lo proporciona automáticamente)
DATABASE_URL=${RAILWAY_POSTGRESQL_URL}

# Puerto (Railway lo asigna automáticamente)
PORT=${PORT}

# JWT y configuración
JWT_SECRET=tu_jwt_secret_aqui
NODE_ENV=production

# CORS (actualizar con nuevas URLs de Railway)
FRONTEND_URL=https://tu-frontend.railway.app
```

### Frontend (`frontend/.env`)
```env
# URL del backend (actualizar con URL de Railway)
VITE_API_URL=https://tu-backend.railway.app/api
VITE_APP_ENV=production
```

## Pasos de Deployment

1. **Crear cuenta en Railway**: https://railway.app
2. **Conectar repositorio GitHub**
3. **Crear servicios separados** para backend y frontend
4. **Configurar PostgreSQL**
5. **Actualizar variables de entorno**
6. **Deploy automático**