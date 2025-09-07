import { Router } from 'express';
import * as administradorController from '../controllers/administrador.controller';

const router = Router();

router.get('/', administradorController.obtenerAdministradores);

router.get('/:id', administradorController.obtenerAdministradorPorId);

router.post('/', administradorController.crearAdministrador);

export default router;