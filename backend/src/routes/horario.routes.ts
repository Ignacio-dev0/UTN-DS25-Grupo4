import { Router } from "express";
import * as horarioController from "../controllers/horaio.controller"

const router = Router();

router.post('/', horarioController.createHorario);

router.get('/:canchaId', horarioController.getHorariosCancha);

export const horarioRoutes=router;