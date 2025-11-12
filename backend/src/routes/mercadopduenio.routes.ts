import { Router } from 'express';
import { crearLinkConexion, autorizarConexion } from '../controllers/mercadopduenio.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Endpoint para que el dueño (logueado) genere la URL
router.post(
    '/connect-url', 
    authenticate, // Asegura que esté logueado
    authorize('DUENIO'), // Asegura que sea dueño
    crearLinkConexion
);

// Endpoint para que el frontend nos envíe el 'code'
router.post(
    '/authorize-connect', 
    authenticate, // Opcional pero recomendado
    autorizarConexion
);

export default router;