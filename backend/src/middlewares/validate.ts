// // src/middlewares/validate.ts
// import { Request, Response, NextFunction } from 'express';
// import { ZodObject, ZodRawShape } from 'zod';

// export const validate = (schema: ZodObject<ZodRawShape>) => 
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       await schema.parseAsync({
//         body: req.body,
//         query: req.query,
//         params: req.params,
//       });
//       return next();
//     } catch (error) {
//       return res.status(400).json(error);
//     }
// };

import { Request, Response, NextFunction } from 'express';
// CORRECCIÓN: Usamos 'ZodObject' en lugar de 'AnyZodObject' para compatibilidad con versiones más antiguas de Zod.
import { ZodObject, ZodError } from 'zod';

// CORRECCIÓN: El tipo del schema se ajusta a ZodObject.
export const validate = (schema: ZodObject<any>) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      // AÑADIMOS ESTE CONSOLE.ERROR PARA VER EL ERROR REAL
      console.error('DEBUG: Error atrapado en el middleware de validación:', error);

      // Nos aseguramos de que el error sea de Zod
      // y devolvemos un JSON más informativo.
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Error de validación',
          // CORRECCIÓN: En versiones más antiguas de Zod, el array de errores está en 'error.issues'.
          errors: error.issues,
        });
      }
      // Si es otro tipo de error, lo pasamos al siguiente manejador
      return next(error);
    }
};

