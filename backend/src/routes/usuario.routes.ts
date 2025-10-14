import { Router } from "express";
import * as usuarioController from "../controllers/usuario.controller";
import { validate } from "../middlewares/validate";
import { crearUsuarioSchema, actualizarUsuarioSchema, usuarioIdSchema, usuarioEmailSchema, registroUsuarioSchema } from "../validations/usuario.validation";
import { uploadSolicitudMiddleware, uploadPerfilMiddleware } from "../middlewares/upload";

const router = Router();

// Rutas de autenticación
router.post('/login', usuarioController.login);
router.post('/register', validate(registroUsuarioSchema), usuarioController.register);
router.post('/register-with-image', uploadSolicitudMiddleware, usuarioController.registerWithImage);

// Rutas CRUD para usuarios
router.post('/', validate(crearUsuarioSchema), usuarioController.crearUsuario);
router.get("/", usuarioController.obtenerUsuarios);
router.get("/:id", validate(usuarioIdSchema), usuarioController.obtenerUsuarioPorId);
router.get("/email/:email", validate(usuarioEmailSchema), usuarioController.obtenerUsuarioPorEmail);
router.put("/:id", validate(usuarioIdSchema), validate(actualizarUsuarioSchema), usuarioController.actualizarUsuario);
router.put("/:id/update-with-image", uploadPerfilMiddleware, usuarioController.actualizarUsuarioConImagen);
router.delete("/:id", validate(usuarioIdSchema), usuarioController.eliminarUsuario);

export default router;
