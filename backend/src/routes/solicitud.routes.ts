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
  solicitudController.uploadMiddleware,
  solicitudController.createRequestWithImage
);

router.get(
  '/',
  authenticate,
  authorize('ADMINISTRADOR'),
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



// // backend/src/routes/solicitud.routes.ts

// import { Router } from 'express';
// import * as solicitudController from '../controllers/solicitud.controller';

// const router = Router();

// // Ej: GET /api/solicitudes  o  GET /api/solicitudes?emisorId=1
// router.get('/', solicitudController.obtenerSolicitudes);

// // Ruta para crear una nueva solicitud
// router.post('/', solicitudController.crearSolicitud);

// // Ruta para obtener una única solicitud por su ID
// router.get('/:id', solicitudController.obtenerSolicitudPorId);

// // Ruta para evaluar una solicitud por ID
// router.patch('/:id', solicitudController.evaluarSolicitud);

// export default router;