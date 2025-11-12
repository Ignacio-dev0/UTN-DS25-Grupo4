// backend/src/app.ts

import express from 'express';
import cors from 'cors';
import path from 'path';
import administradorRoutes from './routes/administrador.routes';
import authRoutes from './routes/auth.routes';
import deporteRoutes from './routes/deportes.routes';
import usuarioRoutes from "./routes/usuario.routes";
import complejoRoutes from './routes/complejo.routes';
import solicitudRoutes from './routes/solicitud.routes';
import resenaRoutes from './routes/resenas.routes';
import canchaRoutes from './routes/cancha.routes';
import horarioRoutes from './routes/horario.routes';
import horarioDeshabilitadoRoutes from './routes/horarioDeshabilitado.routes';
import localidadRoutes from "./routes/localidad.routes";
import turnoRoutes from './routes/turno.routes';
import cronogramaRoutes from './routes/cronograma.routes';
import alquilerRoutes from './routes/alquiler.routes';
import servicioRoutes from './routes/servicio.routes';
import migrationRoutes from './routes/migration.routes';
import debugRoutes from './routes/debug.routes';
import webhookRoutes from './routes/webhook.routes';

// --- NUEVO FLUJO DE MP CONNECT ---
// Ya no exportamos un cliente global. Solo la CLASE.
// Los servicios (pago.service, alquiler.service) crearán clientes
// dinámicamente con el token de cada dueño.
import { MercadoPagoConfig } from 'mercadopago';

/*
// --- LÓGICA ANTIGUA (COMENTADA PARA EVITAR CRASH) ---
// Esta lógica leía el MP_ACCESS_TOKEN global que ya borramos.
import MercadoPago from 'mercadopago';
const mpAccessToken = process.env.MP_ACCESS_TOKEN;
if (!mpAccessToken) {
    console.error("❌ ERROR: MP_ACCESS_TOKEN no está definido en .env");
    process.exit(1);
}
const client = new MercadoPagoConfig({ 
    accessToken: mpAccessToken,
    options: { timeout: 5000 }
});
export const mercadopago = new MercadoPago(client);
// --- FIN LÓGICA ANTIGUA ---
*/

// Exportamos la CLASE para que la usen los servicios
export { MercadoPagoConfig };
// --- FIN NUEVO FLUJO ---


const app = express();

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
const imagesPath = process.env.STATIC_FILES_PATH || 
    (process.env.NODE_ENV === 'production' 
        ? path.join(__dirname, '../public/images')
        : path.join(__dirname, '../public/images'));

console.log(`📂 Images path: ${imagesPath}`);
console.log(`📂 __dirname: ${__dirname}`);
console.log(`📂 NODE_ENV: ${process.env.NODE_ENV}`);

app.use('/images', express.static(imagesPath));
app.use('/api/images', express.static(imagesPath));

// Rutas de API
app.use('/api/administradores', administradorRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/deportes', deporteRoutes);
app.use('/api/resenas', resenaRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use('/api/complejos', complejoRoutes); 
app.use('/api/canchas', canchaRoutes);
app.use('/api/admin/solicitudes', solicitudRoutes);
app.use('/api/horarios', horarioRoutes);
app.use('/api/horarios-deshabilitados', horarioDeshabilitadoRoutes);
app.use('/api/turnos', turnoRoutes);
app.use('/api/cronograma', cronogramaRoutes);
app.use('/api/servicios', servicioRoutes);
app.use('/api/localidades', localidadRoutes);
app.use('/api/alquileres', alquilerRoutes);
app.use('/api/admin', migrationRoutes);
app.use('/api', debugRoutes);
app.use('/api/webhooks', webhookRoutes);

import pagoRoutes from './routes/pago.routes';
app.use('/api/pagos', pagoRoutes);

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

export default app;