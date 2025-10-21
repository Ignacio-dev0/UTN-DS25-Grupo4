// backend/src/services/usuario.service.ts
import prisma from '../config/prisma';
import { Prisma, Usuario} from '@prisma/client';
import { CrearUsuarioData, ActualizarUsuarioData } from '../validations/usuario.validation';
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
    // Primero buscar en Usuario (campo 'correo')
    let usuario = await prisma.usuario.findUnique({ 
        where: { email }
    });
    
    // Si no se encuentra, buscar en Administrador
    if (!usuario) {
        const admin = await prisma.administrador.findUnique({
            where: { email: email }
        });
        
        if (admin) {
            // Convertir administrador a formato Usuario para compatibilidad
            usuario = {
                id: admin.id,
                apellido: 'Admin',
                nombre: 'Administrador',
                dni: '00000000',
                correo: admin.email,
                email: admin.email,
                password: admin.password,
                telefono: null,
                direccion: null,
                rol: admin.rol,
                role: admin.rol,
                image: null
            } as any;
        }
    }
    
    return usuario;
}

export async function getUsuarioByDni(dni: string): Promise<Usuario | null>{
    const usuario = await prisma.usuario.findUnique({ 
        where: { dni: dni }
    });
    
    return usuario;
}

export async function createUsuario(data: CrearUsuarioData): Promise<Usuario>{
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password = hashedPassword;
    const created = await prisma.usuario.create({ data });
    return created;
}

export async function updateUsuario(id: number, updateData: ActualizarUsuarioData): Promise<Usuario>{
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
                ...(dataToUpdate.direccion !== undefined ? { direccion: dataToUpdate.direccion } : {}),
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
        console.log(`🔍 [${new Date().toISOString()}] Checking user relationships for ID: ${id}`);
        
        // Primero verificar qué relaciones tiene el usuario
        const usuario = await prisma.usuario.findUnique({
            where: { id },
            include: {
                complejo: true,
                solicitudes: true,
                reservas: {  // reservas son Alquiler[]
                    include: {
                        turnos: true,
                        pago: true,
                        resenia: true
                    }
                }
            }
        });

        if (!usuario) {
            console.log(`❌ [${new Date().toISOString()}] User not found with ID: ${id}`);
            const error = new Error('Usuario not found');
            (error as any).statusCode = 404;
            throw error;
        }

        console.log(`📊 [${new Date().toISOString()}] User relationships:`, {
            hasComplejo: !!usuario.complejo,
            hasSolicitud: !!usuario.solicitudes,
            reservasCount: usuario.reservas.length
        });

        // Si el usuario tiene un complejo asociado, usar el servicio especializado
        if (usuario.complejo) {
            console.log(`🏢 [${new Date().toISOString()}] User has complejo, using specialized deletion`);
            const { deleteComplejo_sol_dom } = await import('./complejo.service');
            await deleteComplejo_sol_dom(usuario.complejo.id);
            return usuario; // El usuario ya fue eliminado en la transacción del complejo
        }

        // Para usuarios normales, eliminar en transacción
        const deleted = await prisma.$transaction(async (tx) => {
            // Eliminar reservas (alquileres) y sus relaciones
            if (usuario.reservas.length > 0) {
                console.log(`🗑️ [${new Date().toISOString()}] Deleting ${usuario.reservas.length} reservas (alquileres)`);
                for (const alquiler of usuario.reservas) {
                    // Eliminar reseña si existe
                    if (alquiler.resenia) {
                        await tx.resenia.delete({
                            where: { id: alquiler.resenia.id }
                        });
                    }
                    
                    // Eliminar pago si existe
                    if (alquiler.pago) {
                        await tx.pago.delete({
                            where: { id: alquiler.pago.id }
                        });
                    }
                    
                    // Eliminar turnos asociados
                    if (alquiler.turnos.length > 0) {
                        await tx.turno.deleteMany({
                            where: { alquilerId: alquiler.id }
                        });
                    }
                    
                    // Eliminar el alquiler
                    await tx.alquiler.delete({
                        where: { id: alquiler.id }
                    });
                }
            }

            // Eliminar solicitud (si existe y no está asociada a complejo)
            if (usuario.solicitudes) {
                console.log(`🗑️ [${new Date().toISOString()}] Checking solicitud ID: ${usuario.solicitudes.id}`);
                // Solo eliminar solicitud si no está asociada a un complejo
                const complejoAssociated = await tx.complejo.findFirst({
                    where: { solicitudId: usuario.solicitudes.id }
                });
                if (!complejoAssociated) {
                    console.log(`🗑️ [${new Date().toISOString()}] Deleting solicitud ID: ${usuario.solicitudes.id}`);
                    await tx.solicitud.delete({
                        where: { id: usuario.solicitudes.id }
                    });
                } else {
                    console.log(`⚠️ [${new Date().toISOString()}] Cannot delete solicitud - associated with complejo ID: ${complejoAssociated.id}`);
                }
            }

            // Finalmente eliminar el usuario
            console.log(`🗑️ [${new Date().toISOString()}] Deleting user ${id}`);
            return await tx.usuario.delete({ where: { id } });
        });

        console.log(`✅ [${new Date().toISOString()}] User deleted successfully`);
        return deleted;
    } catch (e: any) {
        console.error(`❌ [${new Date().toISOString()}] Error in deleteUsuario:`, {
            id,
            error: e.message,
            code: e.code,
            stack: e.stack
        });
        
        if (e.code === 'P2025') {
            const error = new Error('Usuario not found');
            (error as any).statusCode = 404;
            throw error;
        }
        throw e;
    }
}

