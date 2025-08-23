// backend/src/routes/resenas.routes.ts
import { Router } from 'express';
import resenasController from '../controllers/resenas.controller';

const router = Router();

router.get('/cancha/:canchaId', resenasController.getResenasByCancha);
router.post('/', resenasController.createResena);

export default router;