// backend/src/routes/servicio.routes.ts
import { Router } from 'express';
import * as servicioController from '../controllers/servicio.controller';

const router = Router();

// Rutas para servicios
router.get('/', servicioController.getAllServicios);
router.get('/:id', servicioController.getServicioById);
router.post('/', servicioController.createServicio);
router.put('/:id', servicioController.updateServicio);
router.delete('/:id', servicioController.deleteServicio);

// Rutas para servicios de complejos
router.get('/complejo/:complejoId', servicioController.getServiciosByComplejo);
router.post('/complejo/:complejoId', servicioController.addServicioToComplejo);
router.put('/complejo/:complejoId/:servicioId', servicioController.updateComplejoServicio);
router.delete('/complejo/:complejoId/:servicioId', servicioController.removeServicioFromComplejo);

export default router;
