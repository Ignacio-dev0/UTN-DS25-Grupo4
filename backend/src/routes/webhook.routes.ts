// src/routes/webhook.routes.ts
import { Router } from 'express';
import * as webhookController from '../controllers/webhook.controller';

const router = Router();

/**
 * POST /api/webhooks/mercadopago
 * Esta ruta es llamada por el servidor de Mercado Pago.
 * NO debe tener autenticación (authenticate/authorize).
 */
router.post(
  '/mercadopago',
  webhookController.recibirWebhook
);

export default router;