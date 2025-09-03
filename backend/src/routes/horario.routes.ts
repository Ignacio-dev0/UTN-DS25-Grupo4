import { Router } from "express";
import * as horarioController from "../controllers/horario.controller"

const router = Router();

router.post('/', horarioController.createHorario);

router.get('/:canchaId', horarioController.getHorariosCancha);

export const horarioRoutes=router;