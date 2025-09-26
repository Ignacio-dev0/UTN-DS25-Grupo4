import { Router } from "express";
import * as turnoController from "../controllers/turno.controllers";
    import * as turnoAutomaticoController from "../controllers/turnoAutomatico.controller";
import { validate } from "../middlewares/validate";
import { deduplicateRequests } from "../middlewares/deduplicateRequests";
import { crearTurnoSchema, actualizarTurnoSchema, turnoIdSchema, turnosCanchaSchema } from "../validations/turno.validation";

const router = Router()

// Sistema de turnos automáticos (NUEVO)
router.post('/regenerar/:canchaId', turnoAutomaticoController.regenerarTurnosSemanales);
router.put('/individual/:turnoId', turnoAutomaticoController.actualizarTurnoIndividual);
router.post('/individual', turnoAutomaticoController.crearTurnoIndividual);

// Generar turnos automáticamente (LEGACY)
router.post('/generar', turnoController.generarTurnos);

// CRUD completo para turnos
router.post('/', validate(crearTurnoSchema), turnoController.createTurno);
router.get('/', turnoController.getAllTurnos);
router.get('/:id', validate(turnoIdSchema), turnoController.getTurnoById);
router.get('/cancha/:canchaId', deduplicateRequests, validate(turnosCanchaSchema), turnoController.getTurnosByCancha);
router.put('/:id', validate(turnoIdSchema), validate(actualizarTurnoSchema), turnoController.updateTurno);
router.delete('/:id', validate(turnoIdSchema), turnoController.deleteTurno);

export default router;