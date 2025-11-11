import { Router } from 'express';
import validate from '../middlewares/validate';
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { crearPagoShema, actulizarPagoShema } from '../validations/pago.validation';
import * as pagoController from "../controllers/pago.controller";

const router = Router();

// --- NUEVO: Endpoint para crear la preferencia de Mercado Pago ---
router.post(
  '/crear-preferencia',
  authenticate, // Asegura que el usuario esté logueado
  authorize('CLIENTE'), // Asegura que solo los clientes puedan pagar
  // TODO: Faltaría un 'validate' para asegurar que nos mandan 'turnoId'
  pagoController.crearPreferenciaDePago
);
// --- FIN NUEVO ---

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
