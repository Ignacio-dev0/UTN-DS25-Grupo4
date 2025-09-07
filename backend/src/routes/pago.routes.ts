import { Router } from 'express';
import * as pagoController from "../controllers/pago.controller";
import { validate } from '../middlewares/validate';
import { crearPagoShema, actulizarPagoShema } from '../validations/pago.validation';

const router = Router();
// todos eran post 
router.post('/', validate(crearPagoShema), pagoController.crearPago);
router.put('/:id', validate(actulizarPagoShema), pagoController.actualizarPago);
router.get('/', pagoController.obtenerAllPagos);
router.get('/:id', pagoController.obtenerPagoById);
router.delete('/:id',pagoController.eliminarPago);

export const pagoRoutes = router;
