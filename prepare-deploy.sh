#!/bin/bash

# Script para preparar CanchaYa para despliegue GRATUITO en Render
echo "🚀 Preparando CanchaYa para despliegue GRATUITO en Render..."

# Verificar que estamos en la raíz del proyecto
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
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

echo "✅ ¡Proyecto listo para despliegue GRATUITO!"
echo ""
echo "🔥 Próximos pasos:"
echo "1. Configura una base de datos gratuita:"
echo "   • Supabase: https://supabase.com"
echo "   • Railway: https://railway.app" 
echo "   • Neon: https://neon.tech"
echo ""
echo "2. Sube tus cambios al repositorio:"
echo "   git add ."
echo "   git commit -m 'Prepare for Render free deployment'"
echo "   git push origin main"
echo ""
echo "3. Ve a https://dashboard.render.com/"
echo "4. Crea servicios por separado:"
echo "   • Backend: Web Service"
echo "   • Frontend: Static Site"
echo ""
echo "5. Sigue la guía en DEPLOY_RENDER.md"
echo ""
echo "💰 COSTO TOTAL: $0/mes (Plan gratuito)"
echo ""
echo "🌟 URLs que tendrás:"
echo "   Frontend: https://tu-app.onrender.com"
echo "   Backend:  https://tu-api.onrender.com/api"