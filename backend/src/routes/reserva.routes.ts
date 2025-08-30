import { Router } from "express";
import * as reservaController from '../controllers/reserva.controller';

const router = Router();

router.post('/', reservaController.crearReserva);

router.get('/:id', reservaController.obtenerReservaPorId);

router.get('/', reservaController.ontenerAlquileres);

export default router;