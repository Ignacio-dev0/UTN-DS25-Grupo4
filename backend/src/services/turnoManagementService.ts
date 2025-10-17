// backend/src/services/turnoManagementService.ts
import { PrismaClient, DiaSemana } from '@prisma/client';

const prisma = new PrismaClient();

export class TurnoManagementService {
  
  /**
   * Libera turnos que ya pasaron (operación más eficiente)
   */
  static async liberarTurnosPasados() {
    console.log('🔄 Iniciando liberación de turnos pasados...');
    
    const ahora = new Date();
    const hace1Hora = new Date(ahora.getTime() - 60 * 60 * 1000); // 1 hora atrás
    
    try {
      // 1. Eliminar turnos muy antiguos (más de 1 semana atrás) - Operación más eficiente
      const haceUnaSemana = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
      const turnosEliminados = await prisma.turno.deleteMany({
        where: {
          fecha: {
            lt: haceUnaSemana
          }
        }
      });
      
      console.log(`   🗑️ Eliminados ${turnosEliminados.count} turnos antiguos`);

      // 2. Contar turnos pasados restantes para estadísticas
      const turnosPasadosCount = await prisma.turno.count({
        where: {
          fecha: {
            lt: hace1Hora,
            gte: haceUnaSemana
          }
        }
      });

      console.log(`   � ${turnosPasadosCount} turnos pasados restantes (últimos 7 días)`);

      return {
        turnosPasados: turnosPasadosCount,
        turnosEliminados: turnosEliminados.count
      };

    } catch (error) {
      console.error('❌ Error liberando turnos pasados:', error);
      throw error;
    }
  }

  /**
   * Simula ocupaciones realistas de turnos
   */
  static async simularOcupacionesRealistas() {
    console.log('🎭 Simulando ocupaciones realistas...');
    
    try {
      // Obtener usuarios clientes para asignar reservas
      const clientes = await prisma.usuario.findMany({
        where: { rol: 'CLIENTE' }
      });

      if (clientes.length === 0) {
        console.log('   ⚠️ No hay clientes disponibles para simular ocupaciones');
        return { ocupaciones: 0 };
      }

      // Obtener turnos disponibles de hoy en adelante
      const ahora = new Date();
      const turnosDisponibles = await prisma.turno.findMany({
        where: {
          reservado: false,
          fecha: {
            gte: ahora
          }
        },
        orderBy: {
          fecha: 'asc'
        }
      });

      if (turnosDisponibles.length === 0) {
        console.log('   ⚠️ No hay turnos disponibles para ocupar');
        return { ocupaciones: 0 };
      }

      // Ocupar un porcentaje realista de turnos (15-25%)
      const porcentajeOcupacion = 0.15 + Math.random() * 0.10; // 15% - 25%
      const cantidadAOcupar = Math.floor(turnosDisponibles.length * porcentajeOcupacion);
      
      console.log(`   📊 Ocupando ~${Math.round(porcentajeOcupacion * 100)}% de turnos (${cantidadAOcupar} de ${turnosDisponibles.length})`);

      const turnosAOcupar = [];
      const turnosSeleccionados = [...turnosDisponibles];

      // Seleccionar turnos con patrones realistas
      for (let i = 0; i < cantidadAOcupar && turnosSeleccionados.length > 0; i++) {
        // Preferir turnos en horarios populares (tarde/noche)
        let indiceSeleccionado;
        const horaActual = new Date().getHours();
        
        // 70% probabilidad de seleccionar turnos en horarios populares
        if (Math.random() < 0.7) {
          const turnosPopulares = turnosSeleccionados.filter(turno => {
            const horaTurno = new Date(turno.horaInicio).getUTCHours();
            return horaTurno >= 18 || horaTurno <= 12; // Tarde/noche o mañana temprano
          });
          
          if (turnosPopulares.length > 0) {
            const turnoSeleccionado = turnosPopulares[Math.floor(Math.random() * turnosPopulares.length)];
            indiceSeleccionado = turnosSeleccionados.findIndex(t => t.id === turnoSeleccionado.id);
          } else {
            indiceSeleccionado = Math.floor(Math.random() * turnosSeleccionados.length);
          }
        } else {
          indiceSeleccionado = Math.floor(Math.random() * turnosSeleccionados.length);
        }

        const turnoSeleccionado = turnosSeleccionados.splice(indiceSeleccionado, 1)[0];
        const clienteRandom = clientes[Math.floor(Math.random() * clientes.length)];
        
        turnosAOcupar.push({
          turnoId: turnoSeleccionado.id,
          clienteId: clienteRandom.id
        });
      }

      // Actualizar turnos como ocupados
      if (turnosAOcupar.length > 0) {
        await prisma.turno.updateMany({
          where: {
            id: { in: turnosAOcupar.map(t => t.turnoId) }
          },
          data: { reservado: true }
        });

        // Por ahora solo marcamos turnos como reservados sin crear alquileres completos
        // En una implementación real, aquí se crearían los alquileres correspondientes

        console.log(`   ✅ Ocupados ${turnosAOcupar.length} turnos con reservas simuladas`);
      }

      return { ocupaciones: turnosAOcupar.length };

    } catch (error) {
      console.error('❌ Error simulando ocupaciones:', error);
      throw error;
    }
  }

  /**
   * Genera turnos para las próximas semanas basado en cronogramas
   */
  static async generarTurnosFuturos(semanas: number = 2) {
    console.log(`🔮 Generando turnos para las próximas ${semanas} semanas...`);
    
    try {
      const cronogramas = await prisma.horarioCronograma.findMany();
      const hoy = new Date();
      const turnosData = [];
      
      // Generar turnos para las próximas semanas
      for (let semana = 1; semana <= semanas; semana++) {
        for (let dia = 0; dia < 7; dia++) {
          const fecha = new Date(hoy);
          fecha.setDate(hoy.getDate() + (semana * 7) + dia);
          fecha.setHours(0, 0, 0, 0); // Resetear hora para consistencia
          
          const diaSemanaActual = Object.values(DiaSemana)[fecha.getDay() === 0 ? 6 : fecha.getDay() - 1];
          const cronogramasDelDia = cronogramas.filter(c => c.diaSemana === diaSemanaActual);
          
          for (const cronograma of cronogramasDelDia) {
            // Verificar si ya existe el turno
            const turnoExistente = await prisma.turno.findFirst({
              where: {
                canchaId: cronograma.canchaId,
                fecha: fecha,
                horaInicio: cronograma.horaInicio
              }
            });

            if (!turnoExistente) {
              // 85% de probabilidad de crear el turno (más alta que el seed original)
              if (Math.random() > 0.15) {
                turnosData.push({
                  fecha: fecha,
                  horaInicio: cronograma.horaInicio,
                  precio: cronograma.precio,
                  reservado: false,
                  canchaId: cronograma.canchaId,
                });
              }
            }
          }
        }
      }

      // Crear turnos en lotes
      if (turnosData.length > 0) {
        for (let i = 0; i < turnosData.length; i += 100) {
          const batch = turnosData.slice(i, i + 100);
          await prisma.turno.createMany({
            data: batch,
            skipDuplicates: true
          });
        }
        console.log(`   ✅ Generados ${turnosData.length} turnos futuros`);
      }

      return { turnosGenerados: turnosData.length };

    } catch (error) {
      console.error('❌ Error generando turnos futuros:', error);
      throw error;
    }
  }

  /**
   * Ejecuta el mantenimiento completo del sistema de turnos
   */
  static async ejecutarMantenimientoCompleto() {
    console.log('🔧 Ejecutando mantenimiento completo del sistema de turnos...');
    
    try {
      const resultados = {
        liberacion: await this.liberarTurnosPasados(),
        generacion: await this.generarTurnosFuturos(2),
        ocupacion: await this.simularOcupacionesRealistas()
      };

      console.log('✅ Mantenimiento completo finalizado:', resultados);
      return resultados;

    } catch (error) {
      console.error('❌ Error en mantenimiento completo:', error);
      throw error;
    }
  }
}