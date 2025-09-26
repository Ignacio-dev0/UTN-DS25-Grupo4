import { Router } from 'express';
import { runMigrations } from '../controllers/migration.controller';

const router = Router();

// Endpoint para ejecutar migraciones manualmente (GET y POST)
router.get('/run-migrations', runMigrations);
router.post('/run-migrations', runMigrations);

export default router;