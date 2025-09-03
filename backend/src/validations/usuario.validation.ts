// src/validations/usuario.validation.ts
import { z } from 'zod';

export const crearUsuarioSchema = z.object({
  body: z.object({
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    apellido: z.string().min(3, "El apellido debe tener al menos 3 caracteres"),
    correo: z.string().email("Debe ser un email válido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    fechaNacimiento: z.string().transform((val) => new Date(val)),
    rol: z.enum(["CLIENTE", "DUENIO"]),
  })
});

// .min(new Date(1900, 0, 1), "La fecha de nacimiento no puede ser anterior al 1 de enero de 1900")