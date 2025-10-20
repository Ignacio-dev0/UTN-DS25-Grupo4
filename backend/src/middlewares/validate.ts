import { Request, Response, NextFunction } from 'express';
import { ZodObject } from 'zod';

export default function validate(schema: ZodObject) {
  return async (req: Request<unknown>, res: Response, next: NextFunction) => {
    if (req.body) {
      const result = schema.parse(req.body);
      if (!result.success) next(result.error);
      req.body = result.data;
    }
    next();
  }
}