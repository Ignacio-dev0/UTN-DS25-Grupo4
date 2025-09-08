import { Router } from "express";
import * as turnoController from "../controllers/turno.controllers";

const router = Router()

router.get('/',turnoController.getAllTurnos)
router.get('/:id',turnoController.getTurnoById)
router.get('/cancha/:canchaId',turnoController.getTurnosByCanchaAndDate) //GET /turnos/cancha/1?fecha=2025-09-08
router.post('/',turnoController.createTurno)
router.put('/:id',turnoController.updateTurno)
router.delete('/:id',turnoController.deleteTurno)

export default router;