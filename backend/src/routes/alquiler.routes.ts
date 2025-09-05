import { Router } from "express";
import * as alquilerController from "../controllers/alquiler.controller";

const router = Router();

router.get('/', alquilerController.obtenerAlquileres);

router.get('/:id', alquilerController.obtenerAlquilerPorId);

router.post('/', alquilerController.crearAlquiler);

router.post('/:id/pagar', alquilerController.pagarAlquiler);

router.patch('/:id', alquilerController.actualizarAlquiler);

export default router;