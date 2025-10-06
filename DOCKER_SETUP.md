# 🐳 Docker Setup - CanchaYa

## 📋 Prerrequisitos

- Docker Desktop instalado
- Docker Compose v2.0+

## 🚀 Inicio Rápido

### 1. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar variables según tu entorno
nano .env
```

### 2. Construir y ejecutar

```bash
# Construir todas las imágenes
docker-compose build

# Ejecutar en modo detached
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### 3. Verificar servicios

- **Frontend**: http://localhost:80
- **Backend**: http://localhost:3000
- **Base de datos**: PostgreSQL en puerto 5432

## 🔧 Comandos Útiles

```bash
# Parar servicios
docker-compose down

# Reconstruir y ejecutar
docker-compose up --build

# Ver estado de servicios
docker-compose ps

# Ejecutar comandos en contenedores
docker-compose exec backend npm run migrate
docker-compose exec frontend ls -la

# Limpiar volúmenes
docker-compose down -v
```

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │    │     Backend     │    │   PostgreSQL    │
│   (Nginx)       │◄──►│   (Node.js)     │◄──►│   Database      │
│   Port: 80      │    │   Port: 3000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔒 Características de Seguridad

- ✅ Usuarios no-root en contenedores
- ✅ Headers de seguridad en Nginx
- ✅ Variables de entorno para configuración
- ✅ Redes Docker aisladas
- ✅ Health checks automáticos

## 📊 Monitoreo

```bash
# Ver logs de todos los servicios
docker-compose logs

# Ver logs de un servicio específico
docker-compose logs backend
docker-compose logs frontend

# Verificar health checks
docker-compose ps
```

## 🛠️ Desarrollo

```bash
# Modo desarrollo con hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Ejecutar tests
docker-compose exec backend npm test
docker-compose exec frontend npm test
```

## 🚨 Troubleshooting

### Problema: Puerto ya en uso
```bash
# Verificar qué proceso usa el puerto
netstat -tulpn | grep :80
netstat -tulpn | grep :3000

# Cambiar puertos en docker-compose.yml
```

### Problema: Base de datos no conecta
```bash
# Verificar variables de entorno
docker-compose exec backend env | grep DATABASE

# Reiniciar solo la base de datos
docker-compose restart db
```

### Problema: Frontend no carga
```bash
# Verificar configuración nginx
docker-compose exec frontend nginx -t

# Revisar logs
docker-compose logs frontend
```

## 📈 Optimizaciones Implementadas

- **Multi-stage builds** para imágenes más pequeñas
- **Caché de layers** optimizado
- **Nginx** para servir archivos estáticos
- **Health checks** automáticos
- **Usuarios no-root** para seguridad
- **Compresión gzip** habilitada
- **Headers de seguridad** configurados
