#!/bin/bash

# Script de inicio para el backend en Render
echo "🚀 Iniciando CanchaYa Backend..."

# Ejecutar migraciones de Prisma
echo "📊 Ejecutando migraciones de base de datos..."
npx prisma migrate deploy

# Verificar si las migraciones fueron exitosas
if [ $? -eq 0 ]; then
    echo "✅ Migraciones completadas exitosamente"
else
    echo "❌ Error en las migraciones"
    exit 1
fi

# Generar cliente de Prisma
echo "🔧 Generando cliente de Prisma..."
npx prisma generate

# Iniciar la aplicación
echo "🌟 Iniciando servidor..."
node dist/app.js