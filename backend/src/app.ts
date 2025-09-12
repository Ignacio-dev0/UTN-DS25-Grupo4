// backend/src/app.ts

import express from 'express';
import cors from 'cors';
import path from 'path';
import deporteRoutes from './routes/deportes.routes';
import usuarioRoutes from "./routes/usuario.routes";
import complejoRoutes from './routes/complejo.routes';
import solicitudRoutes from './routes/solicitud.routes'
import resenaRoutes from './routes/resenas.routes';
import canchaRoutes from './routes/cancha.routes';
import horarioRoutes from './routes/horario.routes'
import localidadRoutes from "./routes/localidad.routes"
import turnoRoutes from './routes/turno.routes';
import cronogramaRoutes from './routes/cronograma.routes';
import alquilerRoutes from './routes/alquiler.routes';
import servicioRoutes from './routes/servicio.routes';
import { resetearTurnosDiarios } from './controllers/turnoAutomatico.controller';
// import ownerRoutes from "./routes/owner.routes"
// import domicilioRoutes from './routes/domicilio.routes';
// import pagoRoutes from './routes/pago.routes';
// import administradorRoutes from './routes/administrador.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Aumentar límite para imágenes base64

// Servir archivos estáticos (imágenes) desde la carpeta del frontend
app.use('/images', express.static(path.join(__dirname, '../../frontend/public/images')));

// //con esto intento manejar el tipo bigint en las respuestas json
// app.set('json replacer', (key: string, value:any)=>{
//     if (typeof value === 'bigint'){
//         return value.toString();
//     }
//     return value;
// });

// (MAURO)=> puse cuit como string en lugar de bigint para sacar este GPT-codigo horrible que solo GPT-entiende >:(

// app.use('/api/turnos',            turnoRoutes);
app.use('/api/deportes',          deporteRoutes);
app.use('/api/resenas',           resenaRoutes);
app.use("/api/usuarios",          usuarioRoutes);
app.use('/api/complejos',         complejoRoutes); 
app.use('/api/canchas',           canchaRoutes);
app.use('/api/admin/solicitudes', solicitudRoutes);   // ---> Se ve horrible identado en columnas jaja
app.use('/api/horarios',          horarioRoutes);
app.use('/api/turnos',            turnoRoutes);
app.use('/api/cronograma',        cronogramaRoutes);
app.use('/api/servicios',         servicioRoutes);
app.use('/api/localidades',       localidadRoutes);
app.use('/api/alquileres',        alquilerRoutes);
// app.use('/api/owners',            ownerRoutes);
// app.use('/api/domicilios',        domicilioRoutes);
// app.use('/api/pagos',             pagoRoutes);
// app.use('/api/administradores',   administradorRoutes);

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
    
    // Ejecutar una vez al iniciar el servidor
    setTimeout(async () => {
        try {
            console.log('🔄 Ejecutando reseteo inicial de turnos...');
            await resetearTurnosDiarios();
            console.log('✅ Reseteo inicial completado');
        } catch (error) {
            console.error('❌ Error en reseteo inicial:', error);
        }
    }, 5000); // Esperar 5 segundos después del inicio
});