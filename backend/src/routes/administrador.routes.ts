import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import * as administradorController from '../controllers/administrador.controller';

const router = Router();

router.get(
  '/',
  authenticate,
  authorize('ADMINISTRADOR'),
  administradorController.obtenerAdministradores
);

router.get(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR'),
  administradorController.obtenerAdministradorPorId
);

router.post(
  '/',
  authenticate,
  authorize('ADMINISTRADOR'),
  administradorController.crearAdministrador
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR'),
  administradorController.eliminarAdministrador
);

export default router;