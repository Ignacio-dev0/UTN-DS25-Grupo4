// backend/src/routes/complejo.routes.ts
import { Router } from 'express';
import * as complejoController from '../controllers/complejo.controller';

const router = Router();

// Ruta para obtener todos los complejos
router.get('/', complejoController.obtenerComplejos);

// Ruta para crear un nuevo complejo
router.post('/', complejoController.crearComplejo);

// Ruta para obtener un único complejo por su ID
router.get('/:id', complejoController.obtenerComplejoPorId);

// Ruta para actualizar un complejo por su ID
router.put('/:id', complejoController.actualizarComplejo);

// Ruta para eliminar un complejo por su ID
router.delete('/:id', complejoController.eliminarComplejo);

export default router;