#!/bin/bash

# Script para preparar el proyecto para despliegue en Render
echo "🚀 Preparando CanchaYa para despliegue en Render..."

# Verificar que estamos en la raíz del proyecto
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: Este script debe ejecutarse desde la raíz del proyecto"
    exit 1
fi

# Verificar dependencias del backend
echo "📦 Verificando dependencias del backend..."
cd backend
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json en backend/"
    exit 1
fi

npm install
if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias del backend"
    exit 1
fi

# Verificar build del backend
echo "🔨 Probando build del backend..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error en build del backend"
    exit 1
fi

# Verificar dependencias del frontend
echo "📦 Verificando dependencias del frontend..."
cd ../frontend
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json en frontend/"
    exit 1
fi

npm install
if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias del frontend"
    exit 1
fi

# Verificar build del frontend
echo "🔨 Probando build del frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error en build del frontend"
    exit 1
fi

cd ..

echo "✅ ¡Proyecto listo para despliegue!"
echo ""
echo "🔥 Próximos pasos:"
echo "1. Sube tus cambios al repositorio:"
echo "   git add ."
echo "   git commit -m 'Prepare for Render deployment'"
echo "   git push origin main"
echo ""
echo "2. Ve a https://dashboard.render.com/"
echo "3. Sigue la guía en DEPLOY_RENDER.md"
echo ""
echo "🌟 URLs que tendrás:"
echo "   Frontend: https://tu-app.onrender.com"
echo "   Backend:  https://tu-api.onrender.com/api"