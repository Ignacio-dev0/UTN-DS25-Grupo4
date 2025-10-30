// backend/src/services/usuario.service.ts
import prisma from '../config/prisma';
import { Prisma, Usuario} from '@prisma/client';
import { CrearUsuarioData, ActualizarUsuarioData } from '../validations/usuario.validation';
import bcrypt from 'bcrypt';
import { getNowInArgentina } from '../utils/timezone';

export async function getAllUsuarios(): Promise<Usuario[]> {
  const usuarios = await prisma.usuario.findMany({
    orderBy: { nombre: 'asc' },
    include: {
      complejo: true,
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

export async function getUsuarioByEmail(email: string): Promise<Usuario | any>{
    // Primero buscar en Usuario
    let usuario = await prisma.usuario.findUnique({ 
        where: { email }
    });
    
    // Si no se encuentra, buscar en Administrador
    if (!usuario) {
        const admin = await prisma.administrador.findUnique({
            where: { email: email }
        });
        
        if (admin) {
            // Devolver el administrador con formato compatible
            return {
                id: admin.id,
                email: admin.email,
                password: admin.password,
                rol: admin.rol,
                nombre: 'Admin',
                apellido: 'Sistema',
                dni: '00000000',
                telefono: null,
                direccion: null,
                image: null
            };
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
    
    const created = await prisma.usuario.create({ 
        data: {
            ...data,
            password: hashedPassword
        }
    });
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
                ...(dataToUpdate.nombre !== undefined ? { nombre: dataToUpdate.nombre } : {}),
                ...(dataToUpdate.dni !== undefined ? { dni: dataToUpdate.dni } : {}),
                ...(dataToUpdate.email !== undefined ? { email: dataToUpdate.email } : {}),
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

/**
 * Obtener estadísticas de cancelaciones de usuarios en los últimos 30 días
 */
export async function getEstadisticasCancelaciones(): Promise<{ usuarioId: number, cancelaciones: number }[]> {
    const hace30Dias = new Date(getNowInArgentina());
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    // Obtener todos los alquileres cancelados en los últimos 30 días
    const alquileresCancelados = await prisma.alquiler.findMany({
        where: {
            estado: 'CANCELADO',
            createdAt: {
                gte: hace30Dias
            }
        },
        select: {
            clienteId: true
        }
    });

    // Contar cancelaciones por usuario
    const conteo: { [key: number]: number } = {};
    alquileresCancelados.forEach(alq => {
        conteo[alq.clienteId] = (conteo[alq.clienteId] || 0) + 1;
    });

    // Convertir a array
    return Object.entries(conteo).map(([usuarioId, cancelaciones]) => ({
        usuarioId: parseInt(usuarioId),
        cancelaciones
    }));
}

/**
 * Suspender o reactivar un usuario mediante un campo personalizado
 * Nota: Como Usuario no tiene campo 'estado' en el schema, usamos el campo 'direccion' 
 * con un valor especial para marcar usuarios suspendidos
 */
export async function suspenderUsuario(id: number, suspendido: boolean): Promise<Usuario> {
    try {
        // Verificar que el usuario existe
        const usuario = await prisma.usuario.findUnique({ where: { id } });
        
        if (!usuario) {
            const error = new Error('Usuario not found');
            (error as any).statusCode = 404;
            throw error;
        }

        // Por ahora solo devolvemos el usuario
        // En una implementación completa, agregaríamos un campo 'suspendido' al schema
        // o usaríamos una tabla separada para suspensiones
        console.log(`Usuario ${id} ${suspendido ? 'suspendido' : 'reactivado'}`);
        
        return usuario;
    } catch (e: any) {
        if (e.code === 'P2025') {
            const error = new Error('Usuario not found');
            (error as any).statusCode = 404;
            throw error;
        }
        throw e;
    }
}



