FROM node:20

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

# El script build ahora incluye prisma generate + tsc
RUN npm run build

# Asegurar que las imágenes estén disponibles desde dist/
RUN cp -r public dist/ || echo "No hay carpeta public para copiar"

EXPOSE 3000
CMD ["npm", "run", "start"]
