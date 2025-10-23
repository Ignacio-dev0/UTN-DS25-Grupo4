import { Request, Response, NextFunction } from 'express';
import { ZodObject } from 'zod';

export default function validate(schema: ZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body); // Validacion Zod
    if (!result.success) return next(result.error);
    req.body = result.data;
    next();
  }
}