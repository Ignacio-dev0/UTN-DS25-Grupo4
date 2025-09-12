import { Router } from 'express';
import { runMigrations } from '../controllers/migration.controller';

const router = Router();

// Endpoint para ejecutar migraciones manualmente
router.post('/run-migrations', runMigrations);

export default router;