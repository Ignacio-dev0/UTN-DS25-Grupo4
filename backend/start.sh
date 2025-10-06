#!/bin/sh

echo "🚀 Starting CanchaYa Backend..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
until npx prisma db push --accept-data-loss; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database connection established"

# Run migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🎯 Starting application server..."
exec npm run start