import { Router } from 'express';
import * as horarioDeshabilitadoController from '../controllers/horarioDeshabilitado.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

/**
 * Rutas para gestionar horarios deshabilitados permanentemente
 * Base path: /api/horarios-deshabilitados
 */

// GET /api/horarios-deshabilitados/cancha/:canchaId
// Obtener todos los horarios deshabilitados de una cancha
router.get('/cancha/:canchaId', horarioDeshabilitadoController.obtenerHorariosDeshabilitadosPorCancha);

// POST /api/horarios-deshabilitados
// Deshabilitar un horario permanentemente
router.post(
  '/',
  authenticate,
  authorize('DUENIO', 'ADMINISTRADOR'),
  horarioDeshabilitadoController.deshabilitarHorario
);

// DELETE /api/horarios-deshabilitados/:id
// Habilitar un horario (remover de la lista de deshabilitados)
router.delete(
  '/:id',
  authenticate,
  authorize('DUENIO', 'ADMINISTRADOR'),
  horarioDeshabilitadoController.habilitarHorario
);

export default router;
