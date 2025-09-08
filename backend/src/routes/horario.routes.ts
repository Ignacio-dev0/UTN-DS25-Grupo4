import { Router } from "express";
import * as horarioController from "../controllers/horario.controller"

const router = Router();

router.get('/',horarioController.getAllHorariosCronograma)
router.get('/:id',horarioController.getHorarioCronogramaById)
router.get('/:canchaId',horarioController.getHorariosCronogramaByCanchaId)
router.post('/',horarioController.createHorarioCronograma)
router.put('/:id',horarioController.updateHorarioCronograma)
router.delete('/:id',horarioController.deleteHorarioCronograma)

const horarioRoutes = router;
export default horarioRoutes;