import { Router } from "express";
import * as solicitudController from "../controllers/solicitud.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('DUENIO'),
  solicitudController.createRequest
);

// Nueva ruta para crear solicitudes con imagen
router.post(
  '/with-image',
  authenticate,
  authorize('DUENIO'),
  solicitudController.createRequestWithImage
);

router.get(
  '/',
  authenticate,
  authorize('ADMINISTRADOR', 'DUENIO'), // Permitir también a DUENIO
  solicitudController.getAllSol
);

router.get(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR'),
  solicitudController.getSolById
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR'),
  solicitudController.updateReq
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR'),
  solicitudController.eliminarSoli
);

export default router;
