import { Router } from "express";
import * as domicilioController from "../controllers/domicilio.controller";
import { validate } from "../middlewares/validate";
import { crearDomicilioShema, actualizarDomicilioShema } from "../validations/domicilio.validation";

const router = Router();

router.post('/', validate(crearDomicilioShema), domicilioController.CrearDomicilio);
router.post('/',validate(actualizarDomicilioShema), domicilioController.ActualizarDomicilio);
router.post('/',domicilioController.eliminarDomicilio);
router.post('/',domicilioController.obtenerDomicilioById);
export const domicilioRoutes = router;