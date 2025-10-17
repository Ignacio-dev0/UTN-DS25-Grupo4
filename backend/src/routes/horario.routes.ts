import { Router } from "express";
import { validate } from "../middlewares/validate";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import * as horarioSchema from "../validations/horario.validation";
import * as horarioController from "../controllers/horario.controller"

const router = Router();

// CRUD completo para horarios
router.post(
  '/',
  authenticate,
  authorize('DUENIO'),
  validate(horarioSchema.crearHorario),
  horarioController.createHorario
);

router.get(
  '/',
  authenticate,
  authorize('ADMINISTRADOR'),
  horarioController.getAllHorarios
);

router.get(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR', 'DUENIO'),
  validate(horarioSchema.getHorarioById),
  horarioController.getHorarioById
);

router.put(
  '/:id',
  authenticate,
  authorize('DUENIO'),
  validate(horarioSchema.updateHorario),
  horarioController.updateHorario
);

router.delete(
  '/:id',
  authenticate,
  authorize('DUENIO'),
  validate(horarioSchema.getHorarioById),
  horarioController.deleteHorario
);

export default router;