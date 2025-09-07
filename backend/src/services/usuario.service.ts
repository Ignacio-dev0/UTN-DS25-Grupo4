// backend/src/services/usuario.service.ts
import prisma from '../config/prisma';
import { Prisma, Usuario} from '../generated/prisma';
import { CreateUsuarioRequest, UpdateUsuarioRequest } from '../types/usuario.type';
import bcrypt from 'bcrypt';

export async function getAllUsuarios(): Promise<Usuario[]> {
  const usuarios = await prisma.usuario.findMany({
    orderBy: { nombre: 'asc' },
    include: {
      complejo: true,
      solicitudes: true,
      reservas: true
    }
  });
  return usuarios;
}

export async function getUsuarioById(id: number): Promise<Usuario | null>{
    const usuario = await prisma.usuario.findUnique({ 
        where: { id },
        include: {
          complejo: true,
          solicitudes: true,
          reservas: {
            include: {
              turnos: {
                include: {
                  cancha: {
                    include: {
                      complejo: true,
                      deporte: true
                    }
                  }
                }
              }
            }
          }
        }
    });
    
    return usuario;
}

export async function getUsuarioByEmail(email: string): Promise<Usuario | null>{
    const usuario = await prisma.usuario.findUnique({ 
        where: { correo: email }
    });
    
    return usuario;
}

export async function getUsuarioByDni(dni: number): Promise<Usuario | null>{
    const usuario = await prisma.usuario.findUnique({ 
        where: { dni: dni }
    });
    
    return usuario;
}

export async function createUsuario(data: CreateUsuarioRequest): Promise<Usuario>{
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const created = await prisma.usuario.create({
        data: {
            apellido: data.lastname,
            nombre: data.name,
            dni: data.dni,
            correo: data.correo,
            password: hashedPassword,
            telefono: data.telefono,
            rol: data.rol || 'CLIENTE',
            image: data.image
        },
    });
    return created;
}

export async function updateUsuario(id: number, updateData: UpdateUsuarioRequest): Promise<Usuario>{
    try {
        // Si se actualiza la contraseña, hashearla
        const dataToUpdate: any = { ...updateData };
        if (updateData.password) {
            dataToUpdate.password = await bcrypt.hash(updateData.password, 10);
        }

        const updated = await prisma.usuario.update({
            where: { id },
            data: {
                ...(dataToUpdate.apellido !== undefined ? { apellido: dataToUpdate.apellido } : {}),
                ...(dataToUpdate.name !== undefined ? { nombre: dataToUpdate.name } : {}),
                ...(dataToUpdate.dni !== undefined ? { dni: dataToUpdate.dni } : {}),
                ...(dataToUpdate.correo !== undefined ? { correo: dataToUpdate.correo } : {}),
                ...(dataToUpdate.password !== undefined ? { password: dataToUpdate.password } : {}),
                ...(dataToUpdate.telefono !== undefined ? { telefono: dataToUpdate.telefono } : {}),
                ...(dataToUpdate.rol !== undefined ? { rol: dataToUpdate.rol } : {}),
                ...(dataToUpdate.image !== undefined ? { image: dataToUpdate.image } : {}),
            }
        });
        return updated;
    } catch (e: any) {
        if (e.code === 'P2025') {
            const error = new Error('Usuario not found');
            (error as any).statusCode = 404;
            throw error;
        }
        throw e;
    }
}

export async function deleteUsuario(id: number): Promise<Usuario>{
    try {
        const deleted = await prisma.usuario.delete({ where: { id } });
        return deleted;
    } catch (e: any) {
        if (e.code === 'P2025') {
            const error = new Error('Usuario not found');
            (error as any).statusCode = 404;
            throw error;
        }
        throw e;
    }
}

