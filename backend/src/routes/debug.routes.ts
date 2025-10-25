// Endpoints de debug y diagnóstico para desarrollo/producción
import { Router } from 'express';
import path from 'path';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'CanchaYa Backend API'
  });
});

// Endpoint para diagnosticar archivos estáticos
router.get('/debug/images', async (req, res) => {
  try {
    const fs = require('fs');
    const imagesPath = process.env.STATIC_FILES_PATH || path.join(__dirname, '../public/images');
    
    // Verificar si el directorio existe
    const dirExists = fs.existsSync(imagesPath);
    let files: string[] = [];
    
    if (dirExists) {
      try {
        files = fs.readdirSync(imagesPath, { recursive: true });
      } catch (error) {
        console.error('Error reading images directory:', error);
      }
    }
    
    res.json({
      imagesPath,
      dirExists,
      fileCount: files.length,
      files: files.slice(0, 10), // Solo los primeros 10 archivos
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({ error: 'Debug endpoint failed' });
  }
});

// Endpoint para probar conexión a base de datos
router.get('/debug/database', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Probar la conexión
    await prisma.$connect();
    
    // Obtener conteo de tablas principales
    const counts = await Promise.all([
      prisma.usuario.count(),
      prisma.complejo.count(),
      prisma.cancha.count(),
      prisma.alquiler.count()
    ]);
    
    await prisma.$disconnect();
    
    res.json({
      status: 'Database connected',
      counts: {
        usuarios: counts[0],
        complejos: counts[1],
        canchas: counts[2],
        alquileres: counts[3]
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Database debug error:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      message: error.message 
    });
  }
});

export default router;
