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
// CORRECCIÓN: El tipo del schema se ajusta a ZodObject.
export const validate = (schema: ZodObject<any>) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Determinar qué validar basado en la estructura del schema
      const schemaKeys = Object.keys(schema.shape);
      let dataToValidate;
      
      if (schemaKeys.includes('body') || schemaKeys.includes('params') || schemaKeys.includes('query')) {
        // Schema estructurado con body/params/query
        dataToValidate = {
          body: req.body,
          params: req.params,
          query: req.query
        };
      } else {
        // Schema simple, validar directamente el body
        dataToValidate = req.body;
      }
      
      console.log('=== VALIDACIÓN ===');
      console.log('URL:', req.url);
      console.log('Método:', req.method);
      console.log('Datos a validar:', JSON.stringify(dataToValidate, null, 2));
      console.log('Schema keys:', schemaKeys);
      
      await schema.parseAsync(dataToValidate);
      console.log('✅ Validación exitosa');
      return next();
    } catch (error) {
      // AÑADIMOS ESTE CONSOLE.ERROR PARA VER EL ERROR REAL
      console.error('❌ Error atrapado en el middleware de validación:', error);

      // Nos aseguramos de que el error sea de Zod
      // y devolvemos un JSON más informativo.
      if (error instanceof ZodError) {
        // Extraer el primer mensaje de error para mostrarlo al usuario
        const firstError = error.issues[0];
        const errorMessage = firstError ? firstError.message : 'Error de validación';
        
        return res.status(400).json({
          ok: false,
          error: errorMessage,
          details: error.issues
        });
      }
      // Si es otro tipo de error, lo pasamos al siguiente manejador
      return next(error);
    }
};

