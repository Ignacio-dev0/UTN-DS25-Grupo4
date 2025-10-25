# 🗄️ Configuración de Base de Datos - CanchaYa

Este proyecto ahora soporta **dos entornos de base de datos**:
- 🏠 **Local**: PostgreSQL en tu Mac (desarrollo rápido)
- ☁️ **Railway**: PostgreSQL en la nube (producción y testing remoto)

---

## 📋 Archivos de Configuración

### `.env.local`
Base de datos **LOCAL** (PostgreSQL en tu Mac)
```env
DATABASE_URL="postgresql://thia@localhost:5432/canchaya_local"
FRONTEND_URL=http://localhost:5173
```

### `.env.railway`
Base de datos **RAILWAY** (PostgreSQL en la nube)
```env
DATABASE_URL="postgresql://postgres:...@hopper.proxy.rlwy.net:59063/railway"
FRONTEND_URL=https://front-canchaya.up.railway.app
```

### `.env`
Archivo activo (se copia automáticamente desde `.env.local` o `.env.railway`)

---

## 🚀 Scripts Disponibles

### Desarrollo

```bash
# Usar base de datos LOCAL (recomendado para desarrollo)
cp .env.local .env && npm run dev

# Usar base de datos RAILWAY (para testing con datos reales)
cp .env.railway .env && npm run dev
```

### Migraciones

```bash
# Aplicar migraciones a BD local
npm run migrate:local

# Aplicar migraciones a BD Railway
npm run migrate:railway
```

### Seed

```bash
# Poblar BD local con datos de prueba
npm run seed:local

# Poblar BD Railway con datos de prueba (¡CUIDADO!)
npm run seed:railway
```

### Prisma Studio

```bash
# Ver datos de BD local
npm run studio:local

# Ver datos de BD Railway
npm run studio:railway
```

### Migrar Datos

```bash
# Migrar TODOS los datos desde Railway a Local
npm run migrate-data
```

⚠️ **Este comando:**
- Limpia la BD local
- Copia todos los datos desde Railway
- Mantiene la estructura de IDs

---

## 📊 Datos Migrados

La última migración exitosa copió:

| Tabla | Cantidad |
|-------|----------|
| Usuarios | 17 |
| Complejos | 13 |
| Canchas | 64 |
| Horarios de Cronograma | 6,832 |
| Turnos | 10,836 |
| Alquileres | 3,186 |
| Reseñas | 193 |

---

## 💡 Workflow Recomendado

### Para Desarrollo (día a día):
1. Usa BD local: `cp .env.local .env && npm run dev`
2. Desarrolla features
3. Testea localmente
4. Commit y push

### Para Testing con datos reales:
1. Usa BD Railway: `cp .env.railway .env && npm run dev`
2. Testea con datos de producción
3. Vuelve a local: `cp .env.local .env && npm run dev`

### Para Producción (Railway):
Railway automáticamente usa las variables de entorno configuradas en su dashboard.

---

## ⚡ Ventajas de BD Local

| Local | Railway (remoto) |
|-------|------------------|
| ⚡ **Instantáneo** (~3ms) | 🐌 Lento (~150ms) |
| 💾 Trabaja offline | ☁️ Requiere internet |
| 🔒 Datos privados | 🌍 Datos compartidos |
| 🧪 Pruebas seguras | ⚠️ Cuidado con cambios |

**Ejemplo**: 10 queries por página
- Local: **30ms** en queries
- Railway: **1.5 segundos** en queries

---

## 🔧 Troubleshooting

### PostgreSQL no está corriendo
```bash
# Verificar estado
pg_ctl status -D /opt/homebrew/var/postgresql@16

# Iniciar
pg_ctl -D /opt/homebrew/var/postgresql@16 -l /opt/homebrew/var/log/postgresql@16.log start
```

### Error de conexión a BD local
```bash
# Verificar que existe la BD
psql -U thia -d postgres -c "\l" | grep canchaya_local

# Recrear si es necesario
psql -U thia -d postgres -c "DROP DATABASE IF EXISTS canchaya_local;"
psql -U thia -d postgres -c "CREATE DATABASE canchaya_local;"
npm run migrate:local
npm run migrate-data
```

### Sincronizar con Railway nuevamente
```bash
npm run migrate-data
```

---

## 📝 Notas Importantes

1. **`.env` está en `.gitignore`**: Nunca se commitea
2. **`.env.local` y `.env.railway` SÍ están en git**: Para facilitar setup
3. **Railway usa sus propias variables**: No lee los archivos .env del repo
4. **Migración de datos es segura**: Copia, no mueve los datos

---

## 🎯 Quick Reference

```bash
# Desarrollo normal (rápido)
cp .env.local .env && npm run dev

# Ver datos locales
npm run studio:local

# Resincronizar con Railway
npm run migrate-data

# Testing con Railway
cp .env.railway .env && npm run dev
```

---

**Última actualización**: Octubre 25, 2025
**Migración inicial exitosa** ✅
