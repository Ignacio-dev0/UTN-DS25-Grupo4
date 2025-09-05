import { Request, Response, NextFunction } from "express";
import * as usuarioService from "../services/usuario.service";
import { CreateUsuarioRequest,UsuarioListResponse,UpdateUsuarioRequest,UsuarioResponse } from "../types/usuario.type";


export async function crearUsuario(req: Request, res: Response<UsuarioResponse>){
  try {
    const newUsuario = await usuarioService.createUsuario(req.body)
    res.status(201).json({
        usuario: newUsuario,
        message: 'Usuario created succesfully'
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'El DNI o correo ya están registrados.' });
    }
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

export async function obtenerUsuarios(req: Request, res: Response<UsuarioListResponse>, next:NextFunction) {
    try {
        const usuarios = await usuarioService.getAllUsuarios();
        res.json({
            usuarios,
            total: usuarios.length
        })    
    } catch (error) {
        next
    }
    
  
};

export async function obtenerUsuarioPorId (req: Request, res: Response<UsuarioResponse>,next:NextFunction){
  try {
    const {id} = req.params;
    const usuario = await usuarioService.getUsuarioById(parseInt(id));
    res.json({
        usuario,
        message: ('Usuario retrieved succesfully')
    })
} catch (error) {
    next(error);
  }
    
  
};

export async function actualizarUsuario (req: Request<{id : string}, UsuarioResponse,UpdateUsuarioRequest>,res: Response<UsuarioResponse>) {
  try {
    const {id} = req.params;
    const updateUsuario = await usuarioService.updateUsuario(parseInt(id),req.body);
    res.json({
        usuario: updateUsuario,
        message: 'user Updated succesfully' 
    });
  } catch (error : any) {
    console.log(error);
  }
};

export async function eliminarUsuario (req: Request<{id:string}>, res: Response){
  try {
    const {id} = req.params;
    const deleted = await usuarioService.deleteUsuario(parseInt(id));
    res.json({ usuario:deleted, message: "Usuario deleteado jajaja" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
