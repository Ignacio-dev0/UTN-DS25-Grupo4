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

export const actualizarUsuarioSchema = crearUsuarioSchema.partial();

export const usuarioIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID debe ser un número')
  })
});

export const usuarioEmailSchema = z.object({
  params: z.object({
    email: z.string().email('Debe ser un email válido')
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
