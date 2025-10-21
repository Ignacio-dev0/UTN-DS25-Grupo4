import { Router } from 'express';
import { obtenerCronogramaCancha, obtenerTodosCronogramas, actualizarCronogramaCancha } from '../controllers/cronograma.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get(
  '/cancha/:canchaId',
  authenticate,
  authorize('DUENIO'),
  obtenerCronogramaCancha
);

router.put(
  '/cancha/:canchaId',
  authenticate,
  authorize('DUENIO'),
  actualizarCronogramaCancha
);

router.get(
  '/',
  authenticate,
  authorize('DUENIO'),
  obtenerTodosCronogramas
);

export default router;
