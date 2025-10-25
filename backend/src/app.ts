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
import debugRoutes from './routes/debug.routes';
import { resetearTurnosDiarios } from './controllers/turnoAutomatico.controller';
import { iniciarScheduler } from './services/scheduler.service';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración CORS
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://canchaya.onrender.com',
    'https://front-canchaya.up.railway.app',
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

app.use(express.json({ limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
    console.log(`🌐 [${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Servir archivos estáticos (imágenes)
// En producción Railway: /app/dist/public/images (copiadas por Dockerfile)
// En desarrollo: ../public/images (relativo a dist/)
const imagesPath = process.env.STATIC_FILES_PATH || 
    (process.env.NODE_ENV === 'production' 
        ? path.join(__dirname, '../public/images')  // Desde /app/dist/ a /app/dist/public/images
        : path.join(__dirname, '../public/images'));   // Desarrollo

console.log(`📂 Images path: ${imagesPath}`);
console.log(`📂 __dirname: ${__dirname}`);
console.log(`📂 NODE_ENV: ${process.env.NODE_ENV}`);

app.use('/images', express.static(imagesPath));
app.use('/api/images', express.static(imagesPath));

// Rutas de API
app.use('/api/administradores',   administradorRoutes);
app.use('/api/auth',              authRoutes);
app.use('/api/deportes',          deporteRoutes);
app.use('/api/resenas',           resenaRoutes);
app.use("/api/usuarios",          usuarioRoutes);
app.use('/api/complejos',         complejoRoutes); 
app.use('/api/canchas',           canchaRoutes);
app.use('/api/admin/solicitudes', solicitudRoutes);
app.use('/api/horarios',          horarioRoutes);
app.use('/api/horarios-deshabilitados', horarioDeshabilitadoRoutes);
app.use('/api/turnos',            turnoRoutes);
app.use('/api/cronograma',        cronogramaRoutes);
app.use('/api/servicios',         servicioRoutes);
app.use('/api/localidades',       localidadRoutes);
app.use('/api/alquileres',        alquilerRoutes);
app.use('/api/admin',             migrationRoutes);
app.use('/api',                   debugRoutes);

// Middleware de manejo de errores global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('💥 ERROR:', err.message);

    if (err.name === 'ZodError') {
        return res.status(400).json({ message: 'Error de validación', errors: err.issues });
    }

    if (err.code) {
        if (err.code === 'P2002') return res.status(409).json({ message: 'Ya existe un registro con esos datos' });
        if (err.code === 'P2003') return res.status(400).json({ message: 'Error de referencia: datos no existen' });
        if (err.code === 'P2025') return res.status(404).json({ message: 'Registro no encontrado' });
    }

    if (err.statusCode) {
        return res.status(err.statusCode).json({ message: err.message || 'Error en el servidor' });
    }

    res.status(500).json({
        message: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    
    // 🎯 Iniciar sistema de generación automática de turnos
    iniciarScheduler();
    
    // Job automático cada 24 horas para resetear turnos
    setInterval(async () => {
        try {
            console.log('🔄 Ejecutando job de reseteo automático de turnos...');
            const turnosReseteados = await resetearTurnosDiarios();
            console.log(`✅ Job completado: ${turnosReseteados} turnos reseteados`);
        } catch (error) {
            console.error('❌ Error en job de reseteo de turnos:', error);
        }
    }, 24 * 60 * 60 * 1000);
});
