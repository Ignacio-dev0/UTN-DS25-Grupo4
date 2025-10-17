import { Router } from "express";
import { validate } from "../middlewares/validate";
import { createAlquilerSchema, updateAlquilerSchema, pagarAlquilerSchema } from "../validations/alquiler.validation";
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
  '/',authenticate,
  authorize('CLIENTE'),
  validate(createAlquilerSchema),
  alquilerController.crearAlquiler
);

router.post(
  '/:id/pagar',authenticate,
  authorize('CLIENTE'),
  validate(pagarAlquilerSchema),
  alquilerController.pagarAlquiler
);

router.patch(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR'),
  validate(updateAlquilerSchema),
  alquilerController.actualizarAlquiler
);

export default router;