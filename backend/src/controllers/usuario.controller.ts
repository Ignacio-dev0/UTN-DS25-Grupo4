import { Request, Response } from "express";
import * as usuarioService from "../services/usuario.service";

export const crearUsuario = async (req: Request, res: Response) => {
  try {
    const usuario = await usuarioService.crearUsuario(req.body);
    res.json(usuario);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const obtenerUsuarios = async (_req: Request, res: Response) => {
  const usuarios = await usuarioService.obtenerUsuarios();
  res.json(usuarios);
};

export const obtenerUsuarioPorId = async (req: Request, res: Response) => {
  const usuario = await usuarioService.obtenerUsuarioPorId(Number(req.params.id));
  if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
  res.json(usuario);
};

export const actualizarUsuario = async (req: Request, res: Response) => {
  try {
    const usuario = await usuarioService.actualizarUsuario(Number(req.params.id), req.body);
    res.json(usuario);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const eliminarUsuario = async (req: Request, res: Response) => {
  try {
    await usuarioService.eliminarUsuario(Number(req.params.id));
    res.json({ message: "Usuario eliminado" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};