import { Router } from "express";
import * as usuarioController from "../controllers/usuario.controller";
import { validate } from "../middlewares/validate";
import { crearUsuarioSchema, actualizarUsuarioSchema, usuarioIdSchema, usuarioEmailSchema } from "../validations/usuario.validation";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
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

const upload = multer({ storage });

// Rutas de autenticación
router.post('/login', usuarioController.login);
router.post('/register', usuarioController.register);
router.post('/register-with-image', upload.single('imagen'), usuarioController.registerWithImage);

// Rutas CRUD para usuarios
router.post('/', validate(crearUsuarioSchema), usuarioController.crearUsuario);
router.get("/", usuarioController.obtenerUsuarios);
router.get("/:id", validate(usuarioIdSchema), usuarioController.obtenerUsuarioPorId);
router.get("/email/:email", validate(usuarioEmailSchema), usuarioController.obtenerUsuarioPorEmail);
router.put("/:id", validate(usuarioIdSchema), validate(actualizarUsuarioSchema), usuarioController.actualizarUsuario);
router.delete("/:id", validate(usuarioIdSchema), usuarioController.eliminarUsuario);

export default router;
