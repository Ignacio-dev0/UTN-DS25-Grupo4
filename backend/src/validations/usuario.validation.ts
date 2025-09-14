// src/validations/usuario.validation.ts
import { z } from 'zod';

export const crearUsuarioSchema = z.object({
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

// Schema específico para registro público (más flexible)
export const registroUsuarioSchema = z.object({
  body: z.object({
    nombre: z.string()
      .min(1, "El nombre es requerido")
      .max(100, "El nombre no puede exceder 100 caracteres")
      .trim(),
    apellido: z.string()
      .min(1, "El apellido es requerido")
      .max(100, "El apellido no puede exceder 100 caracteres")
      .trim(),
    dni: z.string()
      .regex(/^\d+$/, 'El DNI debe contener solo números')
      .min(7, "El DNI debe tener al menos 7 dígitos")
      .max(8, "El DNI no puede exceder 8 dígitos"),
    email: z.string()
      .email("Debe ser un email válido")
      .max(150, "El email no puede exceder 150 caracteres"),
    password: z.string()
      .min(6, "La contraseña debe tener al menos 6 caracteres")
      .max(200, "La contraseña no puede exceder 200 caracteres"),
    telefono: z.string()
      .max(30, "El teléfono no puede exceder 30 caracteres")
      .optional(),
    tipoUsuario: z.enum(["CLIENTE", "DUENIO"]).optional(),
    solicitudComplejo: z.object({
      cuit: z.string()
        .min(11, "El CUIT debe tener 11 dígitos")
        .max(11, "El CUIT debe tener 11 dígitos"),
      nombreComplejo: z.string()
        .min(1, "El nombre del complejo es requerido")
        .max(200, "El nombre del complejo no puede exceder 200 caracteres")
        .trim(),
      calle: z.string()
        .min(1, "La calle es requerida")
        .max(200, "La calle no puede exceder 200 caracteres")
        .trim(),
      altura: z.number()
        .int("La altura debe ser un número entero")
        .positive("La altura debe ser un número positivo"),
      localidadId: z.number()
        .int("El ID de localidad debe ser un número entero")
        .positive("El ID de localidad debe ser un número positivo"),
      imagen: z.string().optional()
    }).optional()
  })
});

export const actualizarUsuarioSchema = z.object({
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
    rol: z.enum(["CLIENTE", "DUENIO", "ADMINISTRADOR"]).optional(),
    image: z.string().optional().or(z.literal("")).refine((val) => {
      if (!val || val === "") return true;
      // Acepta URLs normales o data URLs (base64)
      return val.startsWith('http') || val.startsWith('https') || val.startsWith('data:image/');
    }, "La imagen debe ser una URL válida o una imagen en formato base64")
  })
});

export const usuarioIdSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => {
      const num = parseInt(val);
      if (isNaN(num)) throw new Error("ID del usuario debe ser un número");
      return num;
    })
  })
});

export const usuarioEmailSchema = z.object({
  params: z.object({
    email: z.string().email("Debe ser un email válido")
  })
});
