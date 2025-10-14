import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuración de multer para imágenes de solicitudes
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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'solicitud-' + uniqueSuffix + path.extname(file.originalname));
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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'usuario-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configuración común para validación de archivos
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'));
  }
};

// Middlewares de upload configurados
export const uploadSolicitud = multer({ 
  storage: solicitudStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB límite
  fileFilter
});

export const uploadPerfil = multer({ 
  storage: perfilStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB límite
  fileFilter
});

// Middlewares específicos para usar en las rutas
export const uploadSolicitudMiddleware = uploadSolicitud.single('imagen');
export const uploadPerfilMiddleware = uploadPerfil.single('imagen');