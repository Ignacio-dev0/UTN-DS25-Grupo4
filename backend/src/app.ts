// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import deportesRouter from './routes/deportes.routes';
import resenasRouter from './routes/resenas.routes';
import usuarioRoutes from "./routes/usuario.routes";
import complejoRoutes from './routes/complejo.routes';
import canchaRoutes from './routes/cancha.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/deportes', deportesRouter);
app.use('/api/resenas', resenasRouter);
app.use("/usuarios", usuarioRoutes);
app.use('/api/complejos', complejoRoutes); 
app.use('/api/canchas', canchaRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});