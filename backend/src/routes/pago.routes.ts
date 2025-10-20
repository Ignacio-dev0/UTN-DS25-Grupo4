import { Router } from 'express';
import validate from '../middlewares/validate';
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { crearPagoShema, actulizarPagoShema } from '../validations/pago.validation';
import * as pagoController from "../controllers/pago.controller";

const router = Router();

router.get(
  '/',
  authenticate,
  authorize('ADMINISTRADOR'), 
  pagoController.obtenerAllPagos
);

router.get(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR', 'CLIENTE', 'DUENIO'),
  pagoController.obtenerPagoById
);

router.post(
  '/',
  authenticate,
  authorize('CLIENTE'),
  validate(crearPagoShema),
  pagoController.crearPago
);

export default router;
