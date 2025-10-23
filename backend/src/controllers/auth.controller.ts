import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const resultado = await authService.login(req.body);
    return res.status(200).json({
      success: true,
      data: resultado
    });
  } catch (e) { next(e); }
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const resultado = await authService.register(req.body)
    return res.status(201).json({
      success: true,
      data: resultado
    });
  } catch (e) { next(e) }
}