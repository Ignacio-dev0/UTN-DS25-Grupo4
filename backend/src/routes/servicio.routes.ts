// backend/src/routes/servicio.routes.ts
import { Router } from 'express';
import * as servicioController from '../controllers/servicio.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Rutas para servicios
router.get(
  '/',
  servicioController.getAllServicios
);

router.get(
  '/:id',
  servicioController.getServicioById
);

router.post(
  '/',
  authenticate,
  authorize('ADMINISTRADOR'),
  servicioController.createServicio
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR'),
  servicioController.updateServicio
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR'),
  servicioController.deleteServicio
);

// Rutas para servicios de complejos
// Estos endpoints deberían estar en las rutas de complejo
router.get('/complejo/:complejoId', servicioController.getServiciosByComplejo);
router.post('/complejo/:complejoId', servicioController.addServicioToComplejo);
router.put('/complejo/:complejoId/:servicioId', servicioController.updateComplejoServicio);
router.delete('/complejo/:complejoId/:servicioId', servicioController.removeServicioFromComplejo);

export default router;
