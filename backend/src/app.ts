// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import {deporteRoutes} from './routes/deportes.routes';
import {usuarioRoutes} from "./routes/usuario.routes";
import complejoRoutes from './routes/complejo.routes';
import solicitudRoutes from './routes/solicitud.routes'
// import resenasRouter from './routes/resenas.routes';
import canchaRoutes from './routes/cancha.routes';
import {horarioRoutes} from './routes/horario.routes'
import localidadRoutes from "./routes/localidad.routes"
import { turnoRoutes } from './routes/turno.routes';
import ownerRoutes from "./routes/owner.routes"


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/turnos',turnoRoutes)
app.use('/api/deportes', deporteRoutes);
//app.use('/api/resenas', resenasRouter);
app.use("/api/usuarios", usuarioRoutes);
app.use('/api/complejos', complejoRoutes); 
app.use('/api/canchas', canchaRoutes);
app.use('/api/solicitudes', solicitudRoutes);
app.use('/api/horario', horarioRoutes);
app.use('/api/loc', localidadRoutes);
app.use('/api/owner', ownerRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
