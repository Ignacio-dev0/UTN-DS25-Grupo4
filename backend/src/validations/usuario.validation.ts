// src/validations/usuario.validation.ts
import { z } from 'zod';

export const crearUsuarioSchema = z.object({
  body: z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    lastname: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
    dni: z.string().regex(/^\d+$/, 'Dni invalido').min(7).max(8), // regex valida que dni solo tenga digitos 0-9
    correo: z.email("Debe ser un email válido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    telefono: z.string().optional(),
    rol: z.enum(["CLIENTE", "DUENIO", "ADMINISTRADOR"]).optional(),
    image: z.string().url().optional().or(z.literal(""))
  })
});

<<<<<<< HEAD
export const actualizarUsuarioSchema = z.object({
  body: z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
    apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres").optional(),
    dni: z.string().regex(/^\d+$/, 'Dni invalido').min(7).max(8).optional(),
    correo: z.string().email("Debe ser un email válido").optional(),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
    telefono: z.string().optional(),
    direccion: z.string().optional(),
    rol: z.enum(["CLIENTE", "DUENIO", "ADMINISTRADOR"]).optional(),
    image: z.string().optional().or(z.literal("")).refine((val) => {
      if (!val || val === "") return true;
      // Acepta URLs normales o data URLs (base64)
      return val.startsWith('http') || val.startsWith('https') || val.startsWith('data:image/');
    }, "La imagen debe ser una URL válida o una imagen en formato base64")
  })
});

// ID puede pasarse como dato para crear ni actualizar un Usuario

// export const usuarioIdSchema = z.object({
//   params: z.object({
//     id: z.string().transform((val) => {
//       const num = parseInt(val);
//       if (isNaN(num)) throw new Error("ID debe ser un número");
//       return num;
//     })
//   })
// });

// WTF

// export const usuarioEmailSchema = z.object({
//   params: z.object({
//     email: z.string().email("Debe ser un email válido")
//   })
// });
