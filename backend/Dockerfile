FROM node:20

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

# El script build ahora incluye prisma generate + tsc
RUN npm run build

# Ejecutar migraciones en el deploy
RUN npx prisma migrate deploy

EXPOSE 3000
CMD ["npm", "run", "start"]
