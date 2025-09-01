// backend/src/routes/deportes.routes.ts
import { Router } from 'express';
import * as deporteController from '../controllers/deportes.controller';

const router = Router();

router.get('/', deporteController.getAllDeportes);
router.post('/', deporteController.createDeporte);
router.get('/:id', deporteController.getDeporteById);
router.put('/:id', deporteController.updateDeporte);
router.delete('/:id', deporteController.deleteDeporte);

export const deporteRoutes = router;