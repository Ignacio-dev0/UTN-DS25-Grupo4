// backend/src/services/servicio.service.ts
import prisma from '../config/prisma';

export const getAllServicios = async () => {
  try {
    const servicios = await prisma.servicio.findMany({
      include: {
        complejos: {
          include: {
            complejo: {
              select: {
                id: true,
                nombre: true
              }
            }
          }
        }
      }
    });
    return servicios;
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    throw new Error('Error al obtener servicios');
  }
};

export const getServicioById = async (id: number) => {
  try {
    const servicio = await prisma.servicio.findUnique({
      where: { id },
      include: {
        complejos: {
          include: {
            complejo: {
              select: {
                id: true,
                nombre: true
              }
            }
          }
        }
      }
    });
    return servicio;
  } catch (error) {
    console.error('Error al obtener servicio por ID:', error);
    throw new Error('Error al obtener servicio');
  }
};

export const createServicio = async (data: {
  nombre: string;
  descripcion?: string;
  icono?: string;
}) => {
  try {
    const nuevoServicio = await prisma.servicio.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        icono: data.icono
      }
    });
    return nuevoServicio;
  } catch (error) {
    console.error('Error al crear servicio:', error);
    throw new Error('Error al crear servicio');
  }
};

export const updateServicio = async (id: number, data: {
  nombre?: string;
  descripcion?: string;
  icono?: string;
}) => {
  try {
    const servicioActualizado = await prisma.servicio.update({
      where: { id },
      data
    });
    return servicioActualizado;
  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    throw new Error('Error al actualizar servicio');
  }
};

export const deleteServicio = async (id: number) => {
  try {
    // Primero eliminar relaciones
    await prisma.complejoServicio.deleteMany({
      where: { servicioId: id }
    });
    
    // Luego eliminar el servicio
    await prisma.servicio.delete({
      where: { id }
    });
    
    return { message: 'Servicio eliminado correctamente' };
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    throw new Error('Error al eliminar servicio');
  }
};

export const getServiciosByComplejo = async (complejoId: number) => {
  try {
    const servicios = await prisma.complejoServicio.findMany({
      where: { complejoId },
      include: {
        servicio: true
      }
    });
    return servicios;
  } catch (error) {
    console.error('Error al obtener servicios del complejo:', error);
    throw new Error('Error al obtener servicios del complejo');
  }
};

export const addServicioToComplejo = async (data: {
  complejoId: number;
  servicioId: number;
  disponible?: boolean;
}) => {
  try {
    const complejoServicio = await prisma.complejoServicio.create({
      data: {
        complejoId: data.complejoId,
        servicioId: data.servicioId,
        disponible: data.disponible ?? true
      },
      include: {
        servicio: true
      }
    });
    return complejoServicio;
  } catch (error) {
    console.error('Error al agregar servicio al complejo:', error);
    throw new Error('Error al agregar servicio al complejo');
  }
};

export const removeServicioFromComplejo = async (complejoId: number, servicioId: number) => {
  try {
    await prisma.complejoServicio.delete({
      where: {
        complejoId_servicioId: {
          complejoId,
          servicioId
        }
      }
    });
    return { message: 'Servicio removido del complejo correctamente' };
  } catch (error) {
    console.error('Error al remover servicio del complejo:', error);
    throw new Error('Error al remover servicio del complejo');
  }
};

export const updateComplejoServicio = async (
  complejoId: number, 
  servicioId: number, 
  data: { disponible: boolean }
) => {
  try {
    const complejoServicio = await prisma.complejoServicio.update({
      where: {
        complejoId_servicioId: {
          complejoId,
          servicioId
        }
      },
      data: {
        disponible: data.disponible
      },
      include: {
        servicio: true
      }
    });
    return complejoServicio;
  } catch (error) {
    console.error('Error al actualizar servicio del complejo:', error);
    throw new Error('Error al actualizar servicio del complejo');
  }
};
