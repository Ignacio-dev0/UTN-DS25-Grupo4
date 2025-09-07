// backend/src/routes/cancha.routes.ts
import { Router } from 'express';
import * as canchaController from '../controllers/cancha.controller';
import { validate } from '../middlewares/validate';
import { createCanchaSchema, updateCanchaSchema } from '../validations/cancha.validation';

const router = Router();

// Ej: GET /api/canchas  o  GET /api/canchas?complejoId=1
router.get('/', canchaController.obtenerCanchas);

// Ruta para crear una nueva cancha
router.post('/', validate(createCanchaSchema), canchaController.crearCancha);

// Ruta para obtener una única cancha por su ID
router.get('/:id', canchaController.obtenerCanchaPorId);

// Ruta para actualizar una cancha por su ID
router.put('/:id', validate(updateCanchaSchema), canchaController.actualizarCancha);

// Ruta para eliminar una cancha por su ID
router.delete('/:id', canchaController.eliminarCancha);

export default router;