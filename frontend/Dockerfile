FROM node:20 as builder
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
RUN npm ci

# Copiar código fuente y archivos de entorno
COPY . .

# Variables de entorno para el build
ENV VITE_API_URL=https://utn-ds25-grupo4-canchaya.up.railway.app/api
ENV VITE_APP_ENV=production

# Build de la aplicación
RUN npm run build

##-----------------
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist

ENV PORT=80
EXPOSE 80
CMD ["npm", "run", "start"]
