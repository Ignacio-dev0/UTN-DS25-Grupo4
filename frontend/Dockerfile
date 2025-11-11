# --- ETAPA 1: CONSTRUIR LA APP ---
FROM node:20 as builder
WORKDIR /app

# --- INICIO DE LA CORRECCIÓN ---
# 1. Declara el argumento que vamos a recibir desde docker-compose
ARG VITE_API_URL_ARG

# 2. Usa ese argumento para definir la variable de entorno
#    Si el argumento no se pasa, usará la URL de Railway como fallback
ENV VITE_API_URL=${VITE_API_URL_ARG:-https://utn-ds25-grupo4-canchaya.up.railway.app/api}
# --- FIN DE LA CORRECCIÓN ---

ENV VITE_APP_ENV=production

# Copiar package.json del frontend
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar todo el código fuente del frontend
COPY . .

# Build de la aplicación
RUN npm run build

# --- ETAPA 2: SERVIR LA APP ---
# (ESTA ES LA PARTE QUE FALTABA ANTES)
FROM node:20-alpine
WORKDIR /app

# Copiar package.json del frontend
COPY package*.json ./
# Instalar SOLO dependencias de producción (ej: 'serve')
RUN npm ci --omit=dev

# Copiar el build generado desde la etapa 'builder'
COPY --from=builder /app/dist ./dist

ENV PORT=80
EXPOSE 80

# El comando final para correr el servidor
CMD ["npm", "run", "start"]