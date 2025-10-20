import { Router } from 'express';
import * as horarioDeshabilitadoController from '../controllers/horarioDeshabilitado.controller';

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
router.post('/', horarioDeshabilitadoController.deshabilitarHorario);

// DELETE /api/horarios-deshabilitados/:id
// Habilitar un horario (remover de la lista de deshabilitados)
router.delete('/:id', horarioDeshabilitadoController.habilitarHorario);

export default router;
