import { Router } from "express";
import * as localidadController from "../controllers/localidad.controller";
import { validate } from "../middlewares/validate";
import { actualizarLocalidad, crearLocalidad } from "../validations/localidad.validation";

const router = Router();

router.post('/',validate(crearLocalidad), localidadController.crearLoc);
router.put('/:id', validate(actualizarLocalidad), localidadController.actulizarLocalidad);
router.delete('/:id',localidadController.eliminarLocalidad);
router.get('/:id',localidadController. obtenerLocalidadById);
router.get('/', localidadController.getAllLocalidades);

export default router;