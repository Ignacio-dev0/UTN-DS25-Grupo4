import { Router } from "express";

import * as solicitudController from "../controllers/solicitud.controller";

const router = Router();

router.post('/', solicitudController.createRequest);

// Nueva ruta para crear solicitudes con imagen
router.post('/with-image', solicitudController.uploadMiddleware, solicitudController.createRequestWithImage);

router.get('/', solicitudController.getAllSol);

router.get('/:id', solicitudController.getSolById);

router.put('/:id', solicitudController.updateReq)

router.delete('/:id', solicitudController.eliminarSoli);

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