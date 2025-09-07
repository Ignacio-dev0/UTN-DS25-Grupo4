// backend/src/routes/resenas.routes.ts
import { Router } from 'express';
import * as resenasController from '../controllers/resenas.controller';
import { validate } from '../middlewares/validate';
import { 
    crearReseniaSchema, 
    actualizarReseniaSchema, 
    reseniaIdSchema, 
    complejoIdSchema, 
    canchaIdSchema, 
    usuarioIdSchema 
} from '../validations/resenia.validation';

const router = Router();

// Rutas CRUD para reseñas
router.post('/', validate(crearReseniaSchema), resenasController.crearResenia);
router.get('/', resenasController.obtenerTodasLasResenas);
router.get('/:id', validate(reseniaIdSchema), resenasController.obtenerReseniaPorId);
router.put('/:id', validate(reseniaIdSchema), validate(actualizarReseniaSchema), resenasController.actualizarResenia);
router.delete('/:id', validate(reseniaIdSchema), resenasController.eliminarResenia);

// Rutas específicas para obtener reseñas por contexto
router.get('/complejo/:complejoId', validate(complejoIdSchema), resenasController.obtenerResenasPorComplejo);
router.get('/cancha/:canchaId', validate(canchaIdSchema), resenasController.obtenerResenasPorCancha);
router.get('/usuario/:usuarioId', validate(usuarioIdSchema), resenasController.obtenerResenasPorUsuario);

export default router;