# Build stage
FROM node:18-alpine as build

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app
RUN npm install -g serve

COPY --from=build /app/dist ./dist
COPY frontend/package.json ./

EXPOSE $PORT
CMD ["sh", "-c", "serve -s dist -l tcp://0.0.0.0:$PORT"]