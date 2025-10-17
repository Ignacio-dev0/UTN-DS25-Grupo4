import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { createCanchaSchema, updateCanchaSchema } from '../validations/cancha.validation';
import { authenticate, authorize } from "../middlewares/auth.middleware";
import * as canchaController from '../controllers/cancha.controller';

const router = Router();

// Ej: GET /api/canchas  o  GET /api/canchas?complejoId=1
router.get(
  '/',
  canchaController.obtenerCanchas
);

// Ruta para crear una nueva cancha
router.post(
  '/',
  authenticate,
  authorize('DUENIO'),
  validate(createCanchaSchema),
  canchaController.crearCancha
);

// Ruta para obtener canchas por complejo
router.get(
  '/complejo/:complejoId',
  canchaController.obtenerCanchasPorComplejoId
);

// Ruta para obtener una única cancha por su ID
router.get(
  '/:id',
  canchaController.obtenerCanchaPorId
);

// Ruta para actualizar una cancha por su ID
router.put(
  '/:id',
  authenticate,
  authorize('DUENIO'),
  validate(updateCanchaSchema),
  canchaController.actualizarCancha
);

// Ruta para eliminar una cancha por su ID
router.delete(
  '/:id',
  authenticate,
  authorize('DUENIO'),
  canchaController.eliminarCancha
);

export default router;