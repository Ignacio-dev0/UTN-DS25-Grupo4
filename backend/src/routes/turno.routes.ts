import { Router } from "express";
import * as turnoController from "../controllers/turno.controllers";

const router = Router()

router.get('/',turnoController.getAllTurnos)
router.post('/',turnoController.createTurno)

export const turnoRoutes = router