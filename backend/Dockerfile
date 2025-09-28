FROM node:20

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build
RUN npx prisma migrate deploy

EXPOSE 3000
CMD ["npm", "run", "start"]
