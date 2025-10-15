FROM node:20 as builder
WORKDIR /app

# Variables de entorno para el build (definir antes de todo)
ENV VITE_API_URL=https://utn-ds25-grupo4-canchaya.up.railway.app/api
ENV VITE_APP_ENV=production

# Copiar package.json del frontend
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar todo el código fuente del frontend
COPY . .

# Build de la aplicación
RUN npm run build

##-----------------
FROM node:20-alpine
WORKDIR /app

# Copiar package.json del frontend (no de la raíz)
COPY frontend/package*.json ./
RUN npm ci --omit=dev

# Copiar el build generado
COPY --from=builder /app/dist ./dist

ENV PORT=80
EXPOSE 80
CMD ["npm", "run", "start"]
