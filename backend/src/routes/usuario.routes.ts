import { Router } from "express";
import * as usuarioController from "../controllers/usuario.controller";
import { validate } from "../middlewares/validate";
import { crearUsuarioSchema, actualizarUsuarioSchema, usuarioIdSchema, usuarioEmailSchema } from "../validations/usuario.validation";

const router = Router();

// Rutas CRUD para usuarios
router.post('/', validate(crearUsuarioSchema), usuarioController.crearUsuario);
router.get("/", usuarioController.obtenerUsuarios);
router.get("/:id", validate(usuarioIdSchema), usuarioController.obtenerUsuarioPorId);
router.get("/email/:email", validate(usuarioEmailSchema), usuarioController.obtenerUsuarioPorEmail);
router.put("/:id", validate(usuarioIdSchema), validate(actualizarUsuarioSchema), usuarioController.actualizarUsuario);
router.delete("/:id", validate(usuarioIdSchema), usuarioController.eliminarUsuario);

export default router;
