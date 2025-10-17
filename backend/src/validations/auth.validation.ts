import { z } from 'zod';

// Schema específico para registro público (más flexible)
export const registroSchema = z.object({
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

export const loginSchema = z.object({
  body: z.object({
    email: z.string(),
    password: z.string()
  })
});

export type RegistroUsuarioBody = z.infer<typeof registroSchema>['body'];
export type LoginUsuarioBody = z.infer<typeof loginSchema>['body'];