// backend/src/routes/deportes.routes.ts
import { Router } from 'express';
import * as deporteController from '../controllers/deportes.controller';

const router = Router();

router.get('/', deporteController.getAllDeportes);
router.get('/:id', deporteController.getDeporteById);
router.post('/', deporteController.createDeporte);
router.put('/:id', deporteController.updateDeporte);
router.delete('/:id', deporteController.deleteDeporte);

export default router;