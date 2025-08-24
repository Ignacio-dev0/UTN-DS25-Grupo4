// backend/src/services/usuario.service.ts
import prisma from '../lib/prisma';
import { Prisma } from '../generated/prisma/client';

export const crearUsuario = (data: Prisma.UsuarioCreateInput) => {
  return prisma.usuario.create({ data });
};

export const obtenerUsuarios = () => {
  return prisma.usuario.findMany();
};

export const obtenerUsuarioPorId = (id: number) => {
  return prisma.usuario.findUnique({ where: { id } });
};

export const actualizarUsuario = (id: number, data: Prisma.UsuarioUpdateInput) => {
  return prisma.usuario.update({ where: { id }, data });
};

export const eliminarUsuario = (id: number) => {
  return prisma.usuario.delete({ where: { id } });
};