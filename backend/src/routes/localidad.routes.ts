import { Router } from "express";
import * as localidadController from "../controllers/localidad.controller";
import { validate } from "../middlewares/validate";
import { actualizarLocalidad, crearLocalidad } from "../validations/localidad.validation";

const router = Router();

router.post('/',validate(crearLocalidad), localidadController.crearLoc);
router.post('/', validate(actualizarLocalidad), localidadController.actulizarLocalidad);
router.post('/',localidadController.eliminarLocalidad);
router.post('/',localidadController. obtenerLocalidadById);

export const localidadRoutes = router;