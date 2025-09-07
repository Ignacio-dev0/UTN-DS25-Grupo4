import { Router } from "express";
import * as turnoController from "../controllers/turno.controllers";
import { validate } from "../middlewares/validate";
import { createTurnoSchema, updateTurnoSchema } from "../validations/turno.validation";

const router = Router();

router.get('/', turnoController.getAllTurnos)
router.post('/', validate(createTurnoSchema), turnoController.createTurno)

export default router;