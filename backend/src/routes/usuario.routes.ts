import { Router } from "express";
import * as usuarioController from "../controllers/usuario.controller";
import validate from "../middlewares/validate";
import * as usuarioSchema from "../validations/usuario.validation";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, authorize } from "../middlewares/auth.middleware";

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

// Rutas CRUD para usuarios
router.post(
  '/',
  validate(usuarioSchema.crearUsuario),
  usuarioController.crearUsuario
);

router.get(
  "/",
  usuarioController.obtenerUsuarios
);

router.get(
  "/:id",
  usuarioController.obtenerUsuarioPorId
);

router.get(
  "/email/:email",
  usuarioController.obtenerUsuarioPorEmail
);

router.put(
  "/:id",
  authenticate,
  validate(usuarioSchema.actualizarUsuario),
  usuarioController.actualizarUsuario
);

router.delete(
  "/:id",
  authenticate,
  usuarioController.eliminarUsuario
);

export default router;