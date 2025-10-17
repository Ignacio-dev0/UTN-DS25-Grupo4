// src/validations/usuario.validation.ts
import { z } from 'zod';
import { Rol } from '@prisma/client';


const params = z.object({
  id: z.coerce.number().int().positive("El ID debe ser un número entero positivo")
});

export const crearUsuario = z.object({
  params,
  body: z.object({
    name: z.string()
      .min(1, "El nombre es requerido")
      .max(50, "El nombre no puede exceder 50 caracteres")
      .trim(),
    lastname: z.string()
      .min(1, "El apellido es requerido")
      .max(50, "El apellido no puede exceder 50 caracteres")
      .trim(),
    dni: z.string()
      .regex(/^\d+$/, 'El DNI debe contener solo números')
      .min(7, "El DNI debe tener al menos 7 dígitos")
      .max(8, "El DNI no puede exceder 8 dígitos"),
    correo: z.string()
      .email("Debe ser un email válido")
      .max(100, "El email no puede exceder 100 caracteres"),
    password: z.string()
      .min(6, "La contraseña debe tener al menos 6 caracteres")
      .max(100, "La contraseña no puede exceder 100 caracteres"),
    telefono: z.string()
      .max(20, "El teléfono no puede exceder 20 caracteres")
      .optional(),
    rol: z.enum(["CLIENTE", "DUENIO", "ADMINISTRADOR"]).optional(),
    image: z.string().url().optional().or(z.literal(""))
  })
});



export const actualizarUsuario = z.object({
  params,
  body: z.object({
    name: z.string()
      .min(1, "El nombre es requerido")
      .max(100, "El nombre no puede exceder 100 caracteres")
      .trim()
      .optional(),
    apellido: z.string()
      .min(1, "El apellido es requerido")
      .max(100, "El apellido no puede exceder 100 caracteres")
      .trim()
      .optional(),
    dni: z.string()
      .regex(/^\d+$/, 'El DNI debe contener solo números')
      .min(7, "El DNI debe tener al menos 7 dígitos")
      .max(8, "El DNI no puede exceder 8 dígitos")
      .optional(),
    correo: z.string()
      .email("Debe ser un email válido")
      .max(150, "El email no puede exceder 150 caracteres")
      .optional(),
    password: z.string()
      .min(6, "La contraseña debe tener al menos 6 caracteres")
      .max(200, "La contraseña no puede exceder 200 caracteres")
      .optional(),
    telefono: z.string()
      .max(30, "El teléfono no puede exceder 30 caracteres")
      .optional(),
    direccion: z.string()
      .max(200, "La dirección no puede exceder 200 caracteres")
      .optional(),
    image: z.string().optional().or(z.literal("")).refine((val) => {
      if (!val || val === "") return true;
      // Acepta URLs normales o data URLs (base64)
      return val.startsWith('http') || val.startsWith('https') || val.startsWith('data:image/');
    }, "La imagen debe ser una URL válida o una imagen en formato base64")
  })
});

export const getUsuarioById = z.object({
  params
});

export const getUsuarioByEmail = z.object({
  params: z.object({ email: z.email("Debe ser un email válido")})
})