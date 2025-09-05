import { Domicilio, Rol, Usuario } from "../generated/prisma";

export interface CreateUsuarioRequest{
    name: string;
    lastname: string;
    dni: number;
    correo: string;
    password: string;
    fechaNacimiento: Date;
}

export interface UpdateUsuarioRequest{
    name?: string;
    apellido?: string;
    dni?: number;
    correo?: string;
    password?: string;
    fechaNacimiento?: Date;
    rol?: Rol;
    domicilioId?: number;
}

export interface UsuarioResponse{
    usuario: Usuario;
    message: string;
}

export interface UsuarioListResponse{
    usuarios: Usuario[];
    total: number;
}
