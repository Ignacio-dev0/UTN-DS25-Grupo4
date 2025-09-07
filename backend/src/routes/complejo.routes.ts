// backend/src/routes/complejo.routes.ts
import { Router } from 'express';
import * as complejoController from '../controllers/complejo.controller';
import { validate } from '../middlewares/validate';
import * as validationComplejo from "../validations/complejo.validation"
const router = Router();

// Ruta para obtener todos los complejos
router.get('/', complejoController.obtenerComplejos);

// Ruta para crear un nuevo complejo
router.post('/', validate(validationComplejo.crearComplejoSchema) , complejoController.crearComplejo);

// Ruta para obtener un único complejo por su ID
router.get('/:id', validate(validationComplejo.getComplejoByIdSchema) , complejoController.obtenerComplejoPorId);

// Ruta para actualizar un complejo por su ID
router.put('/:id',  validate(validationComplejo.updateComplejoSchema) ,complejoController.actualizarComplejo);

// Ruta para eliminar un complejo por su ID
router.delete('/:id', validate(validationComplejo.getComplejoByIdSchema) ,complejoController.eliminarComplejo);

export default router;