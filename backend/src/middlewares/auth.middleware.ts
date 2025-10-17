import { Usuario } from '@prisma/client';
import { Request, Response, NextFunction } from 'express'
import jwt, { TokenExpiredError } from 'jsonwebtoken'

export type UsuarioPayload = {
  id: number;
  email: string;
  rol: 'USUARIO' | 'DUENIO' | 'ADMINISTRADOR';
}

// Extender tipo Request
declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioPayload
    }
  }
}

// Autenticación: Middleware para identificar usuarios
export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Obtener token del header
    const { authorization } = req.headers
    if (!authorization || !authorization.startsWith('Bearer ')) throw new Error('Se requiere autenticación')
    const token = authorization.split(' ')[1];

    // 2. Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UsuarioPayload;

    // 3. Agregar usuario al request
    req.usuario = {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol
    }
    next()
  } catch (error) {
    if (error instanceof TokenExpiredError) error = new Error('Sesión expirada')
    next(error)
  }
}

// Autorización: Middleware para verificar roles
export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.usuario) throw new Error('Se requiere autenticación')
      if (!roles.includes(req.usuario.rol)) throw new Error('No tiene permiso para esta acción')
    } catch (e) { next(e); }
  }
}