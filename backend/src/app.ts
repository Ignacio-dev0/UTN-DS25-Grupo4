// backend/src/app.ts

import express from 'express';
import cors from 'cors';
import path from 'path';
import administradorRoutes from './routes/administrador.routes';
import authRoutes from './routes/auth.routes'
import deporteRoutes from './routes/deportes.routes';
import usuarioRoutes from "./routes/usuario.routes";
import complejoRoutes from './routes/complejo.routes';
import solicitudRoutes from './routes/solicitud.routes'
import resenaRoutes from './routes/resenas.routes';
import canchaRoutes from './routes/cancha.routes';
import horarioRoutes from './routes/horario.routes'
import horarioDeshabilitadoRoutes from './routes/horarioDeshabilitado.routes';
import localidadRoutes from "./routes/localidad.routes"
import turnoRoutes from './routes/turno.routes';
import cronogramaRoutes from './routes/cronograma.routes';
import alquilerRoutes from './routes/alquiler.routes';
import servicioRoutes from './routes/servicio.routes';
import migrationRoutes from './routes/migration.routes';
import { resetearTurnosDiarios } from './controllers/turnoAutomatico.controller';
// import ownerRoutes from "./routes/owner.routes"
// import domicilioRoutes from './routes/domicilio.routes';
// import pagoRoutes from './routes/pago.routes';
// import administradorRoutes from './routes/administrador.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración CORS más específica
const allowedOrigins = [
    'http://localhost:5173',           // Desarrollo local
    'http://localhost:5174',           // Desarrollo local (puerto alternativo de Vite)
    'http://localhost:3000',           // Desarrollo local alternativo
    'https://canchaya.onrender.com',   // Frontend en producción
    'https://front-canchaya.up.railway.app', // Frontend en Railway
];

if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' })); // Aumentar límite para imágenes base64

// Middleware de logging para debugging
app.use((req, res, next) => {
    console.log(`🌐 [${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.get('Origin') || 'No Origin'}`);
    if (req.method === 'POST' && req.url.includes('register')) {
        console.log('📝 Body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// Servir archivos estáticos (imágenes) desde la carpeta del frontend
app.use('/images', express.static(path.join(__dirname, '../../frontend/public/images')));

// Servir archivos estáticos (imágenes subidas) desde la carpeta del backend
const imagesPath = process.env.STATIC_FILES_PATH || path.join(__dirname, '../public/images');

// Servir imágenes subidas también desde /images (para compatibilidad con rutas guardadas en DB)
app.use('/images', express.static(imagesPath));

// Logging para debugging en Railway (debe ir ANTES del middleware estático)
app.use('/api/images', (req, res, next) => {
    console.log(`📷 [${new Date().toISOString()}] Requesting image: ${req.url}`);
    console.log(`📂 Images path: ${imagesPath}`);
    next();
});

app.use('/api/images', express.static(imagesPath));

// Middleware para manejar errores 404 de imágenes de forma más silenciosa
app.use('/api/images', (req, res, next) => {
    res.status(404).json({ 
        error: 'Imagen no encontrada', 
        path: req.url,
        message: 'La imagen solicitada no existe en el servidor'
    });
});

// //con esto intento manejar el tipo bigint en las respuestas json
// app.set('json replacer', (key: string, value:any)=>{
//     if (typeof value === 'bigint'){
//         return value.toString();
//     }
//     return value;
// });

// (MAURO)=> puse cuit como string en lugar de bigint para sacar este GPT-codigo horrible que solo GPT-entiende >:(

// app.use('/api/turnos',            turnoRoutes);
app.use('/api/administradores',   administradorRoutes);
app.use('/api/auth',              authRoutes);
app.use('/api/deportes',          deporteRoutes);
app.use('/api/resenas',           resenaRoutes);
app.use("/api/usuarios",          usuarioRoutes);
app.use('/api/complejos',         complejoRoutes); 
app.use('/api/canchas',           canchaRoutes);
app.use('/api/admin/solicitudes', solicitudRoutes);   // ---> Se ve horrible identado en columnas jaja
app.use('/api/horarios',          horarioRoutes);
app.use('/api/horarios-deshabilitados', horarioDeshabilitadoRoutes);
app.use('/api/turnos',            turnoRoutes);
app.use('/api/cronograma',        cronogramaRoutes);
app.use('/api/servicios',         servicioRoutes);
app.use('/api/localidades',       localidadRoutes);
app.use('/api/alquileres',        alquilerRoutes);
app.use('/api/admin',             migrationRoutes);
// app.use('/api/owners',            ownerRoutes);
// app.use('/api/domicilios',        domicilioRoutes);
// app.use('/api/pagos',             pagoRoutes);
// app.use('/api/administradores',   administradorRoutes);

// Middleware de manejo de errores global (debe ir después de todas las rutas)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('💥 ERROR GLOBAL MIDDLEWARE:', {
        url: req.url,
        method: req.method,
        body: req.body,
        error: err.message,
        stack: err.stack
    });

    // Error de validación de Zod
    if (err.name === 'ZodError') {
        return res.status(400).json({
            message: 'Error de validación',
            errors: err.issues,
            details: 'Los datos enviados no cumplen con el formato requerido'
        });
    }

    // Error de Prisma (base de datos)
    if (err.code) {
        // Error de constraint único
        if (err.code === 'P2002') {
            return res.status(409).json({
                message: 'Error de duplicación',
                details: 'Ya existe un registro con esos datos únicos'
            });
        }
        // Error de foreign key
        if (err.code === 'P2003') {
            return res.status(400).json({
                message: 'Error de referencia',
                details: 'Los datos referenciados no existen'
            });
        }
        // Error de not found
        if (err.code === 'P2025') {
            return res.status(404).json({
                message: 'Registro no encontrado',
                details: 'El recurso solicitado no existe'
            });
        }
    }

    // Error con código de estado personalizado
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            message: err.message || 'Error en el servidor',
            details: err.details || 'Se produjo un error procesando la solicitud'
        });
    }

    // Error genérico del servidor
    res.status(500).json({
        message: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? err.message : 'Ocurrió un error inesperado'
    });
});

// Health check endpoint para Render
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'CanchaYa Backend API'
    });
});

// Endpoint para diagnosticar archivos estáticos
app.get('/api/debug/images', async (req, res) => {
    try {
        const fs = require('fs');
        const imagesPath = process.env.STATIC_FILES_PATH || path.join(__dirname, '../public/images');
        
        // Verificar si el directorio existe
        const dirExists = fs.existsSync(imagesPath);
        let files = [];
        
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
app.get('/api/debug/database', async (req, res) => {
    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        // Probar la conexión
        await prisma.$connect();
        
        // Obtener conteo de tablas principales
        const counts = await Promise.all([
            prisma.usuario.count(),
            prisma.complejo.count(),
            prisma.solicitud.count(),
            prisma.alquiler.count()
        ]);
        
        await prisma.$disconnect();
        
        res.json({
            status: 'Database connected',
            counts: {
                usuarios: counts[0],
                complejos: counts[1],
                solicitudes: counts[2],
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

// ENDPOINT DE EMERGENCIA - Crear tablas básicas
app.get('/api/create-tables', async (req, res) => {
    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "Usuario" (
                "id" SERIAL NOT NULL,
                "apellido" TEXT NOT NULL,
                "nombre" TEXT NOT NULL,
                "telefono" TEXT NOT NULL,
                "email" TEXT NOT NULL UNIQUE,
                "cuit" TEXT NOT NULL UNIQUE,
                "password" TEXT NOT NULL,
                "rol" TEXT NOT NULL DEFAULT 'CLIENTE',
                "direccion" TEXT,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
            );
        `;
        
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "Cancha" (
                "id" SERIAL NOT NULL,
                "nroCancha" INTEGER NOT NULL,
                "descripcion" TEXT,
                "puntaje" DOUBLE PRECISION,
                "image" TEXT,
                "complejoId" INTEGER NOT NULL,
                "deporteId" INTEGER NOT NULL,
                CONSTRAINT "Cancha_pkey" PRIMARY KEY ("id")
            );
        `;
        
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "Turno" (
                "id" SERIAL NOT NULL,
                "fecha" TIMESTAMP(3) NOT NULL,
                "horaInicio" TIMESTAMP(3) NOT NULL,
                "horaFin" TIMESTAMP(3) NOT NULL,
                "reservado" BOOLEAN NOT NULL DEFAULT false,
                "alquilerId" INTEGER,
                "canchaId" INTEGER NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "Turno_pkey" PRIMARY KEY ("id")
            );
        `;
        
        res.json({ success: true, message: 'Tablas creadas exitosamente' });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false, 
            error: error instanceof Error ? error.message : String(error) 
        });
    }
});

// Endpoint temporal para ejecutar migraciones con SQL directo
app.get('/api/setup-db', async (req, res) => {
    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        // Verificar conexión
        await prisma.$connect();
        
        // Ejecutar SQL directo para crear tablas principales
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "Usuario" (
                "id" SERIAL NOT NULL,
                "apellido" TEXT NOT NULL,
                "nombre" TEXT NOT NULL,
                "telefono" TEXT NOT NULL,
                "email" TEXT NOT NULL,
                "cuit" TEXT NOT NULL,
                "password" TEXT NOT NULL,
                "rol" TEXT NOT NULL DEFAULT 'CLIENTE',
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
            );
        `;
        
        res.json({
            success: true,
            message: 'Base de datos configurada exitosamente',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error configurando base de datos:', error);
        res.status(500).json({
            success: false,
            message: 'Error configurando base de datos',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

// Endpoint para ejecutar migraciones manualmente
app.get('/api/migrate', async (req, res) => {
    try {
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execAsync = promisify(exec);
        
        console.log('🔄 Ejecutando migraciones de Prisma...');
        
        // Ejecutar migraciones
        const { stdout, stderr } = await execAsync('npx prisma migrate deploy');
        
        console.log('✅ Migraciones completadas');
        console.log('STDOUT:', stdout);
        
        res.json({
            success: true,
            message: 'Migraciones ejecutadas correctamente',
            details: stdout
        });
        
    } catch (error) {
        console.error('❌ Error ejecutando migraciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error ejecutando migraciones',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

// Endpoint simple para probar
app.get('/api/test-seed', async (req, res) => {
    res.json({ message: "Seed endpoint is working!" });
});

// Endpoint para ejecutar seed de datos
app.get('/api/seed', async (req, res) => {
    try {
        const { PrismaClient, DiaSemana, Rol, EstadoSolicitud, EstadoAlquiler, MetodoPago } = require('../generated/prisma/client');
        const bcrypt = require('bcrypt');
        const prisma = new PrismaClient();
        
        console.log('🌱 Ejecutando seed...');
        
        // Limpiar base de datos en orden correcto
        await prisma.complejoServicio.deleteMany();
        await prisma.pago.deleteMany();
        await prisma.resenia.deleteMany();
        await prisma.alquiler.deleteMany();
        await prisma.turno.deleteMany();
        await prisma.horarioCronograma.deleteMany();
        await prisma.cancha.deleteMany();
        await prisma.complejo.deleteMany();
        await prisma.solicitud.deleteMany();
        await prisma.administrador.deleteMany();
        await prisma.usuario.deleteMany();
        await prisma.domicilio.deleteMany();
        await prisma.localidad.deleteMany();
        await prisma.deporte.deleteMany();
        await prisma.servicio.deleteMany();

        // Crear localidades
        const localidadesData = [
            { nombre: 'La Plata' },
            { nombre: 'City Bell' }, 
            { nombre: 'Gonnet' },
            { nombre: 'Ensenada' }
        ];
        const localidades = await prisma.localidad.createManyAndReturn({ data: localidadesData });

        // Crear deportes
        const deportesData = [
            { nombre: 'Fútbol 5', icono: '⚽' },
            { nombre: 'Fútbol 11', icono: '🥅' },
            { nombre: 'Vóley', icono: '🏐' },
            { nombre: 'Básquet', icono: '🏀' }
        ];
        const deportes = await prisma.deporte.createManyAndReturn({ data: deportesData });

        // Crear servicios
        const serviciosData = [
            { nombre: 'Estacionamiento', icono: '🚗' },
            { nombre: 'Vestuarios', icono: '👕' },
            { nombre: 'Parrilla', icono: '🔥' },
            { nombre: 'Cantina', icono: '🍕' }
        ];
        const servicios = await prisma.servicio.createManyAndReturn({ data: serviciosData });

        res.json({
            success: true,
            message: 'Seed ejecutado exitosamente',
            data: {
                localidades: localidades.length,
                deportes: deportes.length,
                servicios: servicios.length
            }
        });
        
    } catch (error) {
        console.error('Error en seed:', error);
        res.status(500).json({
            success: false,
            message: 'Error ejecutando seed',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    
    // Job automático cada 24 horas para resetear turnos
    setInterval(async () => {
        try {
            console.log('🔄 Ejecutando job de reseteo automático de turnos...');
            const turnosReseteados = await resetearTurnosDiarios();
            console.log(`✅ Job completado: ${turnosReseteados} turnos reseteados`);
        } catch (error) {
            console.error('❌ Error en job de reseteo de turnos:', error);
        }
    }, 24 * 60 * 60 * 1000); // 24 horas en milisegundos
    
});