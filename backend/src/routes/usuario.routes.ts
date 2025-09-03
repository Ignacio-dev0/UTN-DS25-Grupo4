import { Router } from "express";
import * as usuarioController from "../controllers/usuario.controller";


const router = Router();

router.post('/', usuarioController.crearUsuario);
router.get("/", usuarioController.obtenerUsuarios);
router.get("/:id", usuarioController.obtenerUsuarioPorId);
router.put("/:id", usuarioController.actualizarUsuario);
router.delete("/:id", usuarioController.eliminarUsuario);

export const usuarioRoutes = router;
