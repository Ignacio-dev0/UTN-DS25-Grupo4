// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import deportesRouter from './routes/deportes.routes';
import resenasRouter from './routes/resenas.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/deportes', deportesRouter);
app.use('/api/resenas', resenasRouter);

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});