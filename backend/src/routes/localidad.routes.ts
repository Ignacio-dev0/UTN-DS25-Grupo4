import { Router } from "express";
import * as localidadController from "../controllers/localidad.controller";
import { validate } from "../middlewares/validate";
import { actualizarLocalidad, crearLocalidad } from "../validations/localidad.validation";

const router = Router();

router.get('/', localidadController.obtenerTodasLasLocalidades);
router.get('/:id', localidadController.obtenerLocalidadById);
router.post('/', validate(crearLocalidad), localidadController.crearLoc);
router.put('/:id', validate(actualizarLocalidad), localidadController.actualizarLocalidad);
router.delete('/:id', localidadController.eliminarLocalidad);

export const localidadRoutes = router;