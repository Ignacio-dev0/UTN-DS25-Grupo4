import express from 'express';
import cors from 'cors';
import path from 'path';
import {deporteRoutes} from './routes/deportes.routes';
import {usuarioRoutes} from "./routes/usuario.routes";
import complejoRoutes from './routes/complejo.routes';
import solicitudRoutes from './routes/solicitud.routes'
import {resenasRoutes} from './routes/resenas.routes';
import canchaRoutes from './routes/cancha.routes';
import {horarioRoutes} from './routes/horario.routes'
// import localidadRoutes from "./routes/localidad.routes" lo comento solo por ahora
import {localidadRoutes} from "./routes/localidad.routes"
import { turnoRoutes } from './routes/turno.routes';
import ownerRoutes from "./routes/owner.routes"
import { bigint, string } from 'zod';
import {domicilioRoutes} from './routes/domicilio.routes';
import { pagoRoutes } from './routes/pago.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir archivos estáticos (imágenes) desde la carpeta del frontend
app.use('/images', express.static(path.join(__dirname, '../../frontend/public/images')));

//con esto intento manejar el tipo bigint en las respuestas json
app.set('json replacer', (key: string, value:any)=>{
    if (typeof value === 'bigint'){
        return value.toString();
    }
    return value;
})

app.use('/api/turnos',turnoRoutes)
app.use('/api/deportes', deporteRoutes);
app.use('/api/resenas', resenasRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use('/api/complejos', complejoRoutes); 
app.use('/api/canchas', canchaRoutes);
app.use('/api/admin/solicitudes', solicitudRoutes);
app.use('/api/horario', horarioRoutes);
app.use('/api/loc', localidadRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/domicilio', domicilioRoutes);
app.use('/api/pago', pagoRoutes);


app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
