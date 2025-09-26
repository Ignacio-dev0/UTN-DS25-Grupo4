import { Router } from 'express';
import { obtenerCronogramaCancha, obtenerTodosCronogramas, actualizarCronogramaCancha } from '../controllers/cronograma.controller';

const router = Router();

router.get('/cancha/:canchaId', obtenerCronogramaCancha);
router.put('/cancha/:canchaId', actualizarCronogramaCancha);
router.get('/', obtenerTodosCronogramas);

export default router;
