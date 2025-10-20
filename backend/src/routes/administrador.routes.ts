import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import * as administradorController from '../controllers/administrador.controller';

const router = Router();

router.get(
  '/',
  administradorController.obtenerAdministradores
);

router.get(
  '/:id',
  administradorController.obtenerAdministradorPorId
);

router.post(
  '/',
  administradorController.crearAdministrador
);

router.delete(
  '/:id',
  administradorController.eliminarAdministrador
);

export default router;