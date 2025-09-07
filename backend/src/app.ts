// backend/src/app.ts

import express from 'express';
import cors from 'cors';
import deporteRoutes from './routes/deportes.routes';
import usuarioRoutes from "./routes/usuario.routes";
import complejoRoutes from './routes/complejo.routes';
import solicitudRoutes from './routes/solicitud.routes'
import resenaRoutes from './routes/resenas.routes';
import canchaRoutes from './routes/cancha.routes';
import horarioRoutes from './routes/horario.routes'
import localidadRoutes from "./routes/localidad.routes"
import turnoRoutes from './routes/turno.routes';
import ownerRoutes from "./routes/owner.routes"
import domicilioRoutes from './routes/domicilio.routes';
import pagoRoutes from './routes/pago.routes';
import alquilerRoutes from './routes/alquiler.routes';
import administradorRoutes from './routes/administrador.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// //con esto intento manejar el tipo bigint en las respuestas json
// app.set('json replacer', (key: string, value:any)=>{
//     if (typeof value === 'bigint'){
//         return value.toString();
//     }
//     return value;
// });

// (MAURO)=> puse cuit como string en lugar de bigint para sacar este GPT-codigo horrible que solo GPT-entiende >:(

app.use('/api/turnos',            turnoRoutes);
app.use('/api/deportes',          deporteRoutes);
app.use('/api/resenas',           resenaRoutes);
app.use("/api/usuarios",          usuarioRoutes);
app.use('/api/complejos',         complejoRoutes); 
app.use('/api/canchas',           canchaRoutes);
app.use('/api/admin/solicitudes', solicitudRoutes);   // ---> Se ve horrible identado en columnas jaja
app.use('/api/horarios',          horarioRoutes);
app.use('/api/localidades',       localidadRoutes);
app.use('/api/owners',            ownerRoutes);
app.use('/api/domicilios',        domicilioRoutes);
app.use('/api/pagos',             pagoRoutes);
app.use('/api/alquileres',        alquilerRoutes);
app.use('/api/administradores',   administradorRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});