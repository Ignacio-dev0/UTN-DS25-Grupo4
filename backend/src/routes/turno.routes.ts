import { Router } from "express";
import * as turnoController from "../controllers/turno.controllers";
import { validate } from "../middlewares/validate";
import { crearTurnoSchema, actualizarTurnoSchema, turnoIdSchema, turnosCanchaSchema } from "../validations/turno.validation";

const router = Router()

// CRUD completo para turnos
router.post('/', validate(crearTurnoSchema), turnoController.createTurno);
router.get('/', turnoController.getAllTurnos);
router.get('/:id', validate(turnoIdSchema), turnoController.getTurnoById);
router.get('/cancha/:canchaId', validate(turnosCanchaSchema), turnoController.getTurnosByCancha);
router.put('/:id', validate(turnoIdSchema), validate(actualizarTurnoSchema), turnoController.updateTurno);
router.delete('/:id', validate(turnoIdSchema), turnoController.deleteTurno);

export default router;