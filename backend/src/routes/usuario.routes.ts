import { Router } from "express";
import * as usuarioController from "../controllers/usuario.controller";
import validate from "../middlewares/validate";
import * as usuarioSchema from "../validations/usuario.validation";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

// Rutas de autenticación (públicas, manejadas por auth.routes.ts pero mantenidas por compatibilidad)
router.post('/login', usuarioController.login);
router.post('/register', usuarioController.register);
router.post('/register-with-image', usuarioController.registerWithImage);

// Rutas CRUD para usuarios
router.post(
  '/',
  authenticate,
  authorize('ADMINISTRADOR'),
  validate(usuarioSchema.crearUsuario),
  usuarioController.crearUsuario
);

router.get(
  "/",
  authenticate,
  authorize('ADMINISTRADOR'),
  usuarioController.obtenerUsuarios
);

// Ruta para obtener estadísticas de cancelaciones (admin) - debe ir antes de /:id
router.get(
  "/estadisticas/cancelaciones",
  authenticate,
  authorize('ADMINISTRADOR'),
  usuarioController.obtenerEstadisticasCancelaciones
);

router.get(
  "/:id/image",
  usuarioController.obtenerImagenUsuario
);

router.get(
  "/:id",
  authenticate,
  usuarioController.obtenerUsuarioPorId
);

router.get(
  "/email/:email",
  authenticate,
  usuarioController.obtenerUsuarioPorEmail
);

router.put(
  "/:id",
  authenticate,
  (req, res, next) => {
    // Allow user to update their own profile OR admin to update any profile
    const isOwnProfile = req.usuario?.id === parseInt(req.params.id);
    const isAdmin = req.usuario?.rol === 'ADMINISTRADOR';
    
    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({ error: 'No tiene permiso para actualizar este perfil' });
    }
    next();
  },
  validate(usuarioSchema.actualizarUsuario),
  usuarioController.actualizarUsuario
);

router.put(
  "/:id/update-with-image",
  authenticate,
  (req, res, next) => {
    // Allow user to update their own profile OR admin to update any profile
    const isOwnProfile = req.usuario?.id === parseInt(req.params.id);
    const isAdmin = req.usuario?.rol === 'ADMINISTRADOR';
    
    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({ error: 'No tiene permiso para actualizar este perfil' });
    }
    next();
  },
  usuarioController.actualizarUsuarioConImagen
);

router.delete(
  "/:id",
  authenticate,
  authorize('ADMINISTRADOR'),
  usuarioController.eliminarUsuario
);

// Ruta para suspender/reactivar usuario (admin)
router.put(
  "/:id/suspender",
  authenticate,
  authorize('ADMINISTRADOR'),
  usuarioController.suspenderUsuario
);

// Ruta para reactivar usuario (eliminar cancelaciones y permitir reservas)
router.put(
  "/:id/reactivar",
  authenticate,
  authorize('ADMINISTRADOR'),
  usuarioController.reactivarUsuario
);

export default router;