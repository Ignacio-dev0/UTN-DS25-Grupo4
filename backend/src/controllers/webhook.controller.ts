// src/controllers/webhook.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as webhookService from '../services/webhook.service';

export async function recibirWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const notification = req.body;
    
    // Respondemos inmediatamente a Mercado Pago con 200 OK
    // para que sepa que recibimos la notificación.
    res.status(200).send('Webhook recibido'); 

    // Procesamos la notificación "en segundo plano"
    await webhookService.procesarWebhook(notification);

  } catch (error: any) {
    console.error('💥 Error en Webhook Controller:', error.message);
    // Aunque enviamos 200, registramos el error internamente
  }
}