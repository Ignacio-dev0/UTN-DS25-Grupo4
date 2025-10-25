import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export default function validate(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body) {
        req.body = schema.parse(req.body);
      }
      next();
    } catch (error) {
      next(error);
    }
  }
}