# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files first for better caching
COPY frontend/package*.json ./
RUN npm ci

# Copy all frontend files
COPY frontend/ ./
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app
RUN npm install -g serve

# Copy built files from build stage
COPY --from=build /app/dist ./dist

EXPOSE $PORT
CMD ["sh", "-c", "serve -s dist -l tcp://0.0.0.0:$PORT"]