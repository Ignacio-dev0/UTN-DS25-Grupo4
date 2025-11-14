import { z } from 'zod';

export const solicitarCodigoSchema = z.object({
  email: z
    .string()
    .nonempty('El email es obligatorio')
    .email('Debe ser un email válido')
    .max(150, 'El email no puede exceder 150 caracteres'),
});

export const resetearPasswordSchema = z.object({
  email: z
    .string()
    .nonempty('El email es obligatorio')
    .email('Debe ser un email válido')
    .max(150, 'El email no puede exceder 150 caracteres'),
  codigo: z
    .string()
    .nonempty('El código es obligatorio')
    .regex(/^\d{6}$/, 'El código debe tener 6 dígitos'),
  nuevaPassword: z
    .string()
    .nonempty('La nueva contraseña es obligatoria')
    .min(6, 'La nueva contraseña debe tener al menos 6 caracteres')
    .max(200, 'La nueva contraseña no puede exceder 200 caracteres'),
  resetToken: z
    .string()
    .nonempty('El token de recuperación es obligatorio'),
});
