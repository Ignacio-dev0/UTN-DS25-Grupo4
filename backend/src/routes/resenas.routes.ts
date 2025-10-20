// backend/src/routes/resenas.routes.ts
import { Router } from 'express';
import * as resenasController from '../controllers/resenas.controller';
import validate from '../middlewares/validate';
import { crearReseniaSchema, actualizarReseniaSchema } from '../validations/resenia.validation';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Rutas CRUD para reseñas
router.post(
  '/',
  authenticate,
  authorize('CLIENTE'),
  validate(crearReseniaSchema),
  resenasController.crearResenia
);

router.get(
  '/',
  authenticate,
  authorize('ADMINISTRADOR'),
  resenasController.obtenerTodasLasResenas
);

router.get(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR', 'DUENIO', 'CLIENTE'),
  resenasController.obtenerReseniaPorId
);

// Las reseñas deberían poder modificarse ¿¿¿
// router.put('/:id', validate(reseniaIdSchema), validate(actualizarReseniaSchema), resenasController.actualizarResenia);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMINISTRADOR', 'CLIENTE'),
  resenasController.eliminarResenia
);

// Rutas específicas para obtener reseñas por contexto
// Los endpoints para obtener reseñas deberían estar en las rutas de complejo, cancha y usuario
router.get('/complejo/:complejoId', resenasController.obtenerResenasPorComplejo);
router.get('/cancha/:canchaId', resenasController.obtenerResenasPorCancha);
router.get('/cancha/:canchaId/puntajes', resenasController.obtenerPuntajesResenasPorCancha);
router.get('/usuario/:usuarioId', resenasController.obtenerResenasPorUsuario);

export default router;