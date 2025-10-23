// backend/src/routes/complejo.routes.ts
import { Router } from 'express';
import validate from '../middlewares/validate';
import { authenticate, authorize } from "../middlewares/auth.middleware";
import * as complejoController from '../controllers/complejo.controller';
import * as validationComplejo from "../validations/complejo.validation";

const router = Router();

// Ruta para obtener todos los complejos
router.get(
  '/',
  authenticate,
  authorize('ADMINISTRADOR'),
  complejoController.obtenerComplejos
);

// Ruta para obtener solo complejos aprobados (pública)
router.get(
  '/aprobados',
  complejoController.obtenerComplejosAprobados
);

// Ruta para crear un nuevo complejo
router.post(
  '/',
  authenticate,
  authorize('ADMINISTRADOR'),
  validate(validationComplejo.crearComplejo),
  complejoController.crearComplejo
);

// Ruta para obtener un único complejo por su ID
router.get(
  '/:id',
  authenticate,
  authorize('DUENIO', 'ADMINISTRADOR', 'CLIENTE'),
  complejoController.obtenerComplejoPorId
);

// Ruta para actualizar un complejo por su ID
router.put(
  '/:id',
  authenticate,
  authorize('DUENIO'),
  validate(validationComplejo.updateComplejo),
  complejoController.actualizarComplejo
);

router.patch(
  '/:id',
  authenticate,
  authorize('ADMNISTRADOR'),
  validate(validationComplejo.evaluarComplejo),
  complejoController.evaluarComplejo
)

// Ruta para eliminar un complejo por su ID
router.delete(
  '/:id',
  authenticate,
  authorize('ADMINNISTRADOR'),
  complejoController.eliminarComplejo
);

export default router;