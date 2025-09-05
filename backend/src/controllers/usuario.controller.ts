import { Request, Response, NextFunction } from "express";
import * as usuarioService from "../services/usuario.service";
import { CreateUsuarioRequest, UsuarioListResponse, UpdateUsuarioRequest, UsuarioResponse } from "../types/usuario.type";

export async function crearUsuario(req: Request<{}, UsuarioResponse, CreateUsuarioRequest>, res: Response<UsuarioResponse>) {
  try {
    const newUsuario = await usuarioService.createUsuario(req.body);
    res.status(201).json({
      usuario: newUsuario,
      message: 'Usuario creado exitosamente'
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: 'El DNI o correo ya están registrados.',
        usuario: null,
        message: 'Error de validación'
      } as any);
    }
    return res.status(500).json({ 
      error: 'Error interno del servidor.',
      usuario: null,
      message: 'Error interno'
    } as any);
  }
}

export async function obtenerUsuarios(req: Request, res: Response<UsuarioListResponse>, next: NextFunction) {
  try {
    const usuarios = await usuarioService.getAllUsuarios();
    res.json({
      usuarios,
      total: usuarios.length
    });
  } catch (error) {
    next(error);
  }
}

export async function obtenerUsuarioPorId(req: Request<{id: string}>, res: Response<UsuarioResponse>, next: NextFunction) {
  try {
    const { id } = req.params;
    const usuario = await usuarioService.getUsuarioById(parseInt(id));
    
    if (!usuario) {
      return res.status(404).json({
        usuario: null,
        message: 'Usuario no encontrado'
      } as any);
    }
    
    res.json({
      usuario,
      message: 'Usuario obtenido exitosamente'
    });
  } catch (error) {
    next(error);
  }
}

export async function obtenerUsuarioPorEmail(req: Request<{email: string}>, res: Response<UsuarioResponse>, next: NextFunction) {
  try {
    const { email } = req.params;
    const usuario = await usuarioService.getUsuarioByEmail(email);
    
    if (!usuario) {
      return res.status(404).json({
        usuario: null,
        message: 'Usuario no encontrado'
      } as any);
    }
    
    res.json({
      usuario,
      message: 'Usuario obtenido exitosamente'
    });
  } catch (error) {
    next(error);
  }
}

export async function actualizarUsuario(req: Request<{id: string}, UsuarioResponse, UpdateUsuarioRequest>, res: Response<UsuarioResponse>) {
  try {
    const { id } = req.params;
    const updateUsuario = await usuarioService.updateUsuario(parseInt(id), req.body);
    res.json({
      usuario: updateUsuario,
      message: 'Usuario actualizado exitosamente'
    });
  } catch (error: any) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        usuario: null,
        message: 'Usuario no encontrado'
      } as any);
    }
    return res.status(500).json({
      usuario: null,
      message: 'Error interno del servidor'
    } as any);
  }
}

export async function eliminarUsuario(req: Request<{id: string}>, res: Response) {
  try {
    const { id } = req.params;
    const deleted = await usuarioService.deleteUsuario(parseInt(id));
    res.json({ 
      usuario: deleted, 
      message: "Usuario eliminado exitosamente" 
    });
  } catch (error: any) {
    if (error.statusCode === 404) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado',
        message: 'El usuario que intentas eliminar no existe'
      });
    }
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo eliminar el usuario'
    });
  }
}
