// backend/src/services/usuario.service.ts
import prisma from '../config/prisma';
import { Usuario} from '../generated/prisma';
import { CreateUsuarioRequest, UpdateUsuarioRequest } from '../types/usuario.type';

export async function getAllUsuarios(): Promise<Usuario[]> {
  const usuarios= await prisma.usuario.findMany({orderBy: {nombre: 'asc'}});
  return usuarios;
}

export async function getUsuarioById(id: number): Promise<Usuario>{
    const usuario = await prisma.usuario.findUnique({ where: {id }});
    if (!usuario) {
        const error = new Error('Usuario not Found');
        (error as any).statusCode = 404;
        throw error;
    }
    
    return usuario;
}

export async function createUsuario(data: CreateUsuarioRequest): Promise<Usuario>{
    const created = await prisma.usuario.create({
        data:{
            apellido: data.lastname,
            nombre: data.name,
            dni: data.dni,
            correo: data.correo,
            password: data.password,
            fechaNacimiento: data.fechaNacimiento,
            rol: data.rol,
            domicilioId: 0, // Temporalmente asignamos 0, se debe actualizar luego
        },
    });
    return created;
}