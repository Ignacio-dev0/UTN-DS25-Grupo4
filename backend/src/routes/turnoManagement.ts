// backend/src/routes/turnoManagement.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { TurnoManagementService } from '../services/turnoManagementService';

const prisma = new PrismaClient();

const router = Router();

/**
 * Ejecuta mantenimiento completo del sistema de turnos
 * POST /api/turno-management/mantenimiento
 */
router.post('/mantenimiento', async (req, res) => {
  try {
    console.log('🔧 Iniciando mantenimiento manual del sistema de turnos...');
    
    const resultados = await TurnoManagementService.ejecutarMantenimientoCompleto();
    
    res.json({
      success: true,
      message: 'Mantenimiento completado exitosamente',
      data: resultados,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error en mantenimiento de turnos:', error);
    res.status(500).json({
      success: false,
      message: 'Error ejecutando mantenimiento',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * Solo libera turnos pasados (operación más ligera)
 * POST /api/turno-management/liberar-pasados
 */
router.post('/liberar-pasados', async (req, res) => {
  try {
    console.log('🔄 Liberando turnos pasados...');
    
    const resultado = await TurnoManagementService.liberarTurnosPasados();
    
    res.json({
      success: true,
      message: 'Turnos pasados liberados exitosamente',
      data: resultado,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error liberando turnos:', error);
    res.status(500).json({
      success: false,
      message: 'Error liberando turnos pasados',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * Solo simula nuevas ocupaciones
 * POST /api/turno-management/simular-ocupaciones
 */
router.post('/simular-ocupaciones', async (req, res) => {
  try {
    console.log('🎭 Simulando nuevas ocupaciones...');
    
    const resultado = await TurnoManagementService.simularOcupacionesRealistas();
    
    res.json({
      success: true,
      message: 'Ocupaciones simuladas exitosamente',
      data: resultado,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error simulando ocupaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error simulando ocupaciones',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * Obtiene estadísticas del sistema de turnos
 * GET /api/turno-management/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const ahora = new Date();
    const hace1Semana = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
    const en1Semana = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000);

    const stats = {
      turnosTotal: await prisma.turno.count(),
      turnosDisponibles: await prisma.turno.count({
        where: { 
          reservado: false,
          fecha: { gte: ahora }
        }
      }),
      turnosOcupados: await prisma.turno.count({
        where: { 
          reservado: true,
          fecha: { gte: ahora }
        }
      }),
      turnosPasados: await prisma.turno.count({
        where: { 
          fecha: { lt: ahora }
        }
      }),
      turnosProximaSemana: await prisma.turno.count({
        where: { 
          fecha: { 
            gte: ahora,
            lte: en1Semana
          }
        }
      }),
      ultimaActualizacion: new Date().toISOString()
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router;