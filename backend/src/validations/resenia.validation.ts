// src/validations/resenia.validation.ts
import { z } from 'zod';

export const crearReseniaSchema = z.object({
  body: z.object({
    descripcion: z.string()
      .min(10, "La descripción debe tener al menos 10 caracteres")
      .max(500, "La descripción no puede exceder 500 caracteres")
      .trim(), // Limpiar espacios en blanco
    puntaje: z.number()
      .int("El puntaje debe ser un número entero")
      .min(1, "El puntaje debe ser al menos 1")
      .max(5, "El puntaje no puede ser mayor a 5"),
    alquilerId: z.number()
      .int("El ID del alquiler debe ser un número entero")
      .positive("El ID del alquiler debe ser un número positivo")
  })
});

export const actualizarReseniaSchema = z.object({
  body: z.object({
    descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres").max(500, "La descripción no puede exceder 500 caracteres").optional(),
    puntaje: z.number().int().min(1, "El puntaje debe ser al menos 1").max(5, "El puntaje no puede ser mayor a 5").optional()
  })
});

export const reseniaIdSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => {
      const num = parseInt(val);
      if (isNaN(num)) throw new Error("ID debe ser un número");
      return num;
    })
  })
});

export const complejoIdSchema = z.object({
  params: z.object({
    complejoId: z.string().transform((val) => {
      const num = parseInt(val);
      if (isNaN(num)) throw new Error("ID del complejo debe ser un número");
      return num;
    })
  })
});

export const canchaIdSchema = z.object({
  params: z.object({
    canchaId: z.string().transform((val) => {
      const num = parseInt(val);
      if (isNaN(num)) throw new Error("ID de la cancha debe ser un número");
      return num;
    })
  })
});

export const usuarioIdSchema = z.object({
  params: z.object({
    usuarioId: z.string().transform((val) => {
      const num = parseInt(val);
      if (isNaN(num)) throw new Error("ID del usuario debe ser un número");
      return num;
    })
  })
});