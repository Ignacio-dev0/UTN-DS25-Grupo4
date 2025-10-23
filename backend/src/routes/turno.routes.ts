import { Router } from "express";
import * as turnoController from "../controllers/turno.controllers";
import * as turnoAutomaticoController from "../controllers/turnoAutomatico.controller";
import validate from "../middlewares/validate";
// import { deduplicateRequests } from "../middlewares/deduplicateRequests";
import { crearTurnoSchema, actualizarTurnoSchema } from "../validations/turno.validation";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router()

// Sistema de turnos automáticos (NUEVO)
router.post(
  '/regenerar/:canchaId',
  authenticate,
  authorize('DUENIO'),
  turnoAutomaticoController.regenerarTurnosSemanales
);

router.put(
  '/individual/:turnoId',
  authenticate,
  authorize('DUENIO'),
  turnoAutomaticoController.actualizarTurnoIndividual
);

router.post(
  '/individual',
  authenticate,
  authorize('DUENIO'),
  turnoAutomaticoController.crearTurnoIndividual
);

// Generar turnos automáticamente (LEGACY)
// ¿¿¿¿¿¿¿¿
router.post(
  '/generar',
  authenticate,
  authorize('ADMINISTRADOR'),
  turnoController.generarTurnos
);

// CRUD completo para turnos
router.post(
  '/',
  authenticate,
  authorize('DUENIO'),
  validate(crearTurnoSchema),
  turnoController.createTurno
);

router.get(
  '/',
  authenticate,
  authorize('ADMINISTRADOR'),
  turnoController.getAllTurnos
);

router.get(
  '/:id',
  authenticate,
  authorize('DUENIO', 'ADMINISTRADOR'),
  turnoController.getTurnoById
);

// Este endpoint debería estar en las rutas de cancha
// router.get(
//   '/cancha/:canchaId',
//   authenticate,
//   authorize('ADMINISTRADOR'),
//   deduplicateRequests,
//   validate(turnosCanchaSchema),
//   turnoController.getTurnosByCancha
// );

router.put(
  '/:id',
  authenticate,
  authorize('DUENIO'),
  validate(actualizarTurnoSchema),
  turnoController.updateTurno
);

router.delete(
  '/:id',
  authenticate,
  authorize('DUENIO'),
  turnoController.deleteTurno
);

export default router;