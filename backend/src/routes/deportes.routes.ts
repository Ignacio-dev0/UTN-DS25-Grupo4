// backend/src/routes/deportes.routes.ts
import { Router } from 'express';
import deportesController from '../controllers/deportes.controller';

const router = Router();

router.get('/', deportesController.getAllDeportes);
router.post('/', deportesController.createDeporte);

export default router;