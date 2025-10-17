import { Router } from "express";
import * as localidadController from "../controllers/localidad.controller";
import { validate } from "../middlewares/validate";
import { actualizarLocalidad, crearLocalidad } from "../validations/localidad.validation";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.get(
  '/',
  localidadController.obtenerTodasLasLocalidades
);

router.get(
  '/:id',
  localidadController.obtenerLocalidadById
);

router.post(
  '/',
  authenticate,
  authorize('ADMINISTRADOR'),
  validate(crearLocalidad),
  localidadController.crearLoc
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR'),
  validate(actualizarLocalidad),
  localidadController.actualizarLocalidad
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR'),
  localidadController.eliminarLocalidad
);

export default router;