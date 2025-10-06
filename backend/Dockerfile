# Build stage
FROM node:20-alpine as builder
WORKDIR /app

# Copy package files for better caching
COPY package*.json ./

# Install all deps (including dev) to have prisma CLI and typescript available
RUN npm ci && npm cache clean --force

# Copy source code (including prisma schema)
COPY . .

# Generate Prisma client BEFORE compiling TypeScript so types exist
RUN npx prisma generate

# Build the application
RUN npm run build

# Prune devDependencies to keep only production deps for the next stage
RUN npm prune --omit=dev

# Production stage
FROM node:20-alpine
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built application and production dependencies
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Create uploads directory
RUN mkdir -p uploads && chown nextjs:nodejs uploads

# Switch to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "echo '🚀 Starting CanchaYa Backend...' && echo '⏳ Waiting for database connection...' && until npx prisma db push --accept-data-loss; do echo 'Database is unavailable - sleeping'; sleep 2; done && echo '✅ Database connection established' && echo '🔧 Generating Prisma client...' && npx prisma generate && echo '🎯 Starting application server...' && exec npm run start"]
