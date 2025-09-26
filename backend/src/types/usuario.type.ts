import { Rol, Usuario } from "@prisma/client";

export interface CreateUsuarioRequest {
    name: string;
    lastname: string;
    dni: string;
    correo: string;
    password: string;
    telefono?: string;
    rol?: Rol;
    image?: string;
}

export interface UpdateUsuarioRequest {
    name?: string;
    apellido?: string;
    dni?: string;
    correo?: string;
    password?: string;
    telefono?: string;
    direccion?: string;
    rol?: Rol;
    image?: string;
}

export interface UsuarioResponse {
    usuario: Usuario;
    message: string;
}

export interface UsuarioListResponse {
    usuarios: Usuario[];
    total: number;
}
