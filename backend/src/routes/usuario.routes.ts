import { Router } from "express";
import * as usuarioController from "../controllers/usuario.controller";
import { validate } from "../middlewares/validate";
import { crearUsuarioSchema, actualizarUsuarioSchema, usuarioIdSchema, usuarioEmailSchema, registroUsuarioSchema } from "../validations/usuario.validation";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configuración de multer para subida de imágenes de solicitudes
const solicitudStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'public/images/solicitudes/';
    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `solicitud-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  }
});

// Configuración de multer para imágenes de perfil de usuario
const perfilStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'public/images/usuarios/';
    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `perfil-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  }
});

const uploadSolicitud = multer({ storage: solicitudStorage });
const uploadPerfil = multer({ storage: perfilStorage });

// Rutas de autenticación
router.post('/login', usuarioController.login);
router.post('/register', validate(registroUsuarioSchema), usuarioController.register);
router.post('/register-with-image', uploadSolicitud.single('imagen'), usuarioController.registerWithImage);

// Rutas CRUD para usuarios
router.post('/', validate(crearUsuarioSchema), usuarioController.crearUsuario);
router.get("/", usuarioController.obtenerUsuarios);
router.get("/:id", validate(usuarioIdSchema), usuarioController.obtenerUsuarioPorId);
router.get("/email/:email", validate(usuarioEmailSchema), usuarioController.obtenerUsuarioPorEmail);
router.put("/:id", validate(usuarioIdSchema), validate(actualizarUsuarioSchema), usuarioController.actualizarUsuario);
router.put("/:id/update-with-image", uploadPerfil.single('imagen'), usuarioController.actualizarUsuarioConImagen);
router.delete("/:id", validate(usuarioIdSchema), usuarioController.eliminarUsuario);

export default router;
