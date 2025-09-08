import { Router } from 'express';
import { obtenerCronogramaCancha, obtenerTodosCronogramas } from '../controllers/cronograma.controller';

const router = Router();

router.get('/cancha/:canchaId', obtenerCronogramaCancha);
router.get('/', obtenerTodosCronogramas);

export default router;
