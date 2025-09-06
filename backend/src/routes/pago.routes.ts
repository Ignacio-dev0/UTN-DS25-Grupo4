import { Router } from 'express';
import * as pagoController from "../controllers/pago.controller";
import { validate } from '../middlewares/validate';
import { crearPagoShema, actulizarPagoShema } from '../validations/pago.validation';

const router = Router();

router.post('/', validate(crearPagoShema), pagoController.crearPago);
router.post('/', validate(actulizarPagoShema), pagoController.actualizarPago);
router.post('/', pagoController.obtenerAllPagos);
router.post('/', pagoController.obtenerPagoById);
router.post('/',pagoController.eliminarPago);

export const pagoRoutes = router;
