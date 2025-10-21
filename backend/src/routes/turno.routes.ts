import { Router } from "express";
import * as turnoController from "../controllers/turno.controllers";
import * as turnoAutomaticoController from "../controllers/turnoAutomatico.controller";
import validate from "../middlewares/validate";
import { deduplicateRequests } from "../middlewares/deduplicateRequests";
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

router.get(
  '/cancha/:canchaId',
  deduplicateRequests,
  turnoController.getTurnosByCancha
);

// Rutas para obtener turnos por semana (deben estar ANTES de las rutas con :id)
router.get('/cancha/:canchaId/semana/:offset', turnoController.getTurnosPorSemana);
router.get('/cancha/:canchaId/disponibles/semana/:offset', turnoController.getTurnosDisponiblesPorSemana);
router.get('/cancha/:canchaId/disponibles/hoy', turnoController.getTurnosDisponiblesHoy);

// Rutas para deshabilitar/habilitar turnos
router.post(
  '/:id/deshabilitar',
  authenticate,
  authorize('DUENIO'),
  turnoController.deshabilitarTurno
);

router.post(
  '/:id/habilitar',
  authenticate,
  authorize('DUENIO'),
  turnoController.habilitarTurno
);

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