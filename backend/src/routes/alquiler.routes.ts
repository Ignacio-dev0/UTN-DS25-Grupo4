import { Router } from "express";
import * as alquilerController from "../controllers/alquiler.controller";
import { validate } from "../middlewares/validate";
import { createAlquilerSchema, updateAlquilerSchema, pagarAlquilerSchema } from "../validations/alquiler.validation";
const router = Router();

router.get('/', alquilerController.obtenerAlquileres);

router.get('/complejo/:complejoId', alquilerController.obtenerAlquileresPorComplejo);

router.get('/:id', alquilerController.obtenerAlquilerPorId);

router.post('/', validate(createAlquilerSchema) ,alquilerController.crearAlquiler);

router.post('/:id/pagar', validate(pagarAlquilerSchema), alquilerController.pagarAlquiler);

router.patch('/:id', validate(updateAlquilerSchema), alquilerController.actualizarAlquiler);

export default router;