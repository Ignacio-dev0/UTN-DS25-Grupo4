// backend/src/services/usuario.service.ts
import prisma from '../config/prisma';
import { Prisma, Usuario} from '../generated/prisma';
import { CreateUsuarioRequest, UpdateUsuarioRequest } from '../types/usuario.type';

export async function getAllUsuarios(): Promise<Usuario[]> {
  const usuarios= await prisma.usuario.findMany({orderBy: {nombre: 'asc'}});
  return usuarios;
}

export async function getUsuarioById(id: number): Promise<Usuario>{
    const usuario = await prisma.usuario.findUnique({ 
        where: {id },
        include:{
            domicilio:true
        }
    });
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
            password: data.password, //hashear
            fechaNacimiento: data.fechaNacimiento,
        },
    });
    return created;
}

export async function updateUsuario(id: number, updateData: UpdateUsuarioRequest) : Promise<Usuario>{
    try {
        const updated= await prisma.usuario.update({
            where: {id},
            data: {
                ...(updateData.apellido !== undefined ? {apellido:updateData.apellido} : {}),
                ...(updateData.name !== undefined ? {nombre:updateData.name} : {}),
                ...(updateData.dni !== undefined ? {dni:updateData.dni} : {}),
                ...(updateData.correo !== undefined ? {correo:updateData.correo} : {}),
                ...(updateData.password !== undefined ? {password:updateData.password} : {}),
                ...(updateData.fechaNacimiento !== undefined ? {fechaNacimiento:updateData.fechaNacimiento} : {}),
                ...(updateData.rol !== undefined ? {rol:updateData.rol} : {}),
                ...(updateData.domicilioId !== undefined ? {domicilioId:updateData.domicilioId} : {}),

            }
        });
        return updated;
    } catch (e : any){
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
        const deleted = await prisma.usuario.delete({where :{id}});
        return deleted;
    } catch (e : any) {
        if (e.code === 'P2025') {
            const error = new Error('Usuario not found');
            (error as any).statusCode = 400;
            throw error;
        }
        throw e;
    }
}

//hacer funciones para traer con resenias y traer con alquileres
//agregar foto a todo lo que necesite foto

