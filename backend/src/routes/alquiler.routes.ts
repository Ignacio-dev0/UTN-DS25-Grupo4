import { Router } from "express";
import validate from "../middlewares/validate";
import * as alquilerSchema from "../validations/alquiler.validation";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import * as alquilerController from "../controllers/alquiler.controller";

const router = Router();

router.get(
  '/',
  authenticate,
  authorize('CLIENTE', 'ADMINISTRADOR', 'DUENIO'),
  alquilerController.obtenerAlquileres
);

router.get(
  '/complejo/:complejoId',
  authenticate,
  authorize('CLIENTE', 'ADMINISTRADOR', 'DUENIO'),
  alquilerController.obtenerAlquileresPorComplejo
);

router.get(
  '/:id',
  authenticate,
  authorize('CLIENTE', 'ADMINISTRADOR', 'DUENIO'),
  alquilerController.obtenerAlquilerPorId
);

router.post(
  '/',
  authenticate,
  authorize('CLIENTE'),
  validate(alquilerSchema.crearAlquiler),
  alquilerController.crearAlquiler
);

router.post(
  '/:id/pagar',
  authenticate,
  authorize('CLIENTE'),
  validate(alquilerSchema.pagarAlquiler),
  alquilerController.pagarAlquiler
);

router.patch(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR', 'CLIENTE'),
  validate(alquilerSchema.actualizarAlquiler),
  alquilerController.actualizarAlquiler
);

export default router;