// backend/src/routes/deportes.routes.ts
import { Router } from 'express';
import * as deporteController from '../controllers/deportes.controller';
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.get(
  '/',
  deporteController.getAllDeportes
);

router.get(
  '/:id',
  deporteController.getDeporteById
);

router.post(
  '/',
  authenticate,
  authorize('ADMINISTRADOR'),
  deporteController.createDeporte
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR'),
  deporteController.updateDeporte
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR'),
  deporteController.deleteDeporte
);

export default router;