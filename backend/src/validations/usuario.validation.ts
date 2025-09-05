// src/validations/usuario.validation.ts
import { z } from 'zod';

export const crearUsuarioSchema = z.object({
  body: z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    lastname: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
    dni: z.number().int().min(1000000, "El DNI debe tener al menos 7 dígitos").max(99999999, "El DNI no puede tener más de 8 dígitos"),
    correo: z.string().email("Debe ser un email válido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    telefono: z.string().optional(),
    rol: z.enum(["CLIENTE", "DUENIO", "ADMINISTRADOR"]).optional(),
    image: z.string().url().optional().or(z.literal(""))
  })
});

export const actualizarUsuarioSchema = z.object({
  body: z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
    apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres").optional(),
    dni: z.number().int().min(1000000, "El DNI debe tener al menos 7 dígitos").max(99999999, "El DNI no puede tener más de 8 dígitos").optional(),
    correo: z.string().email("Debe ser un email válido").optional(),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
    telefono: z.string().optional(),
    rol: z.enum(["CLIENTE", "DUENIO", "ADMINISTRADOR"]).optional(),
    image: z.string().url().optional().or(z.literal(""))
  })
});

export const usuarioIdSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => {
      const num = parseInt(val);
      if (isNaN(num)) throw new Error("ID debe ser un número");
      return num;
    })
  })
});

export const usuarioEmailSchema = z.object({
  params: z.object({
    email: z.string().email("Debe ser un email válido")
  })
});
