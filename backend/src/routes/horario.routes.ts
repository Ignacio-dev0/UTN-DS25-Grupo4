import { Router } from "express";
import * as horarioController from "../controllers/horario.controller"
import { validate } from "../middlewares/validate";
import { crearHorarioSchema, actualizarHorarioSchema, horarioIdSchema, horariosCanchaSchema } from "../validations/horario.validation";

const router = Router();

// CRUD completo para horarios
router.post('/', validate(crearHorarioSchema), horarioController.createHorario);
router.get('/', horarioController.getAllHorarios);
router.get('/:id', validate(horarioIdSchema), horarioController.getHorarioById);
router.get('/cancha/:canchaId', validate(horariosCanchaSchema), horarioController.getHorariosCancha);
router.put('/:id', validate(horarioIdSchema), validate(actualizarHorarioSchema), horarioController.updateHorario);
router.delete('/:id', validate(horarioIdSchema), horarioController.deleteHorario);

export default router;