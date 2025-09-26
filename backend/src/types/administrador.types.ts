import { Administrador } from "@prisma/client";

export interface CreateAdministradorRequest {
  email: string,
  password: string,
}

export interface AdministradorResponse {
  administrador: Administrador,
  message: string,
}

export interface AdministradorListResponse {
  administradores: Administrador[],
  total: number,
}