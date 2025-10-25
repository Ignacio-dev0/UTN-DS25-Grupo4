import { Rol, Usuario } from "@prisma/client";

export interface UsuarioResponse {
    usuario: Usuario;
    message: string;
}

export interface UsuarioListResponse {
    usuarios: Usuario[];
    total: number;
}
