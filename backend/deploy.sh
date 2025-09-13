#!/bin/bash

# Script de deployment para Railway
echo "🚀 Iniciando deployment para Railway..."

# Verificar directorio de trabajo
echo "📂 Working directory: $(pwd)"

# Limpiar build anterior
echo "🧹 Cleaning previous build..."
rm -rf dist/

# Instalar dependencias
echo "📦 Installing dependencies..."
npm install

# Generar cliente Prisma
echo "🗄️ Generating Prisma client..."
npx prisma generate

# Compilar TypeScript
echo "🔧 Building TypeScript..."
npm run build

# Verificar que el build fue exitoso
if [ -d "dist" ]; then
    echo "✅ Build successful!"
    echo "📁 Build contents:"
    ls -la dist/
else
    echo "❌ Build failed!"
    exit 1
fi

# Crear directorio para imágenes si no existe
echo "📷 Creating images directory..."
mkdir -p public/images/usuarios
mkdir -p public/images/complejos
mkdir -p public/images/solicitudes

echo "🎉 Deployment preparation complete!"