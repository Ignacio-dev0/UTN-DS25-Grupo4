import { Request,Response } from "express";
import * as turnoService from "../services/turno.service";

export async function generarTurnos(req: Request, res: Response) {
    try {
        const turnosCreados = await turnoService.generarTurnosDesdeHoy();
        res.json({
            message: `Se generaron ${turnosCreados} turnos nuevos`,
            turnosCreados
        });
    } catch (error: any) {
        // Manejo específico para errores de conectividad de base de datos
        if (error.message && error.message.includes("Can't reach database server")) {
            console.log(`⚠️ TURNO CONTROLLER - Base de datos no disponible para generar turnos, devolviendo mensaje informativo`);
            return res.status(200).json({
                message: 'Servicio temporalmente no disponible',
                turnosCreados: 0
            });
        }
        return res.status(500).json({ error: 'Error generando turnos: ' + error.message });
    }
}

export async function createTurno(req: Request, res: Response){
    try {
        const newTurno = await turnoService.createTurno(req.body);
        res.status(201).json({
            turno: newTurno,
            message: 'Turno created'
        }) 
    } catch (error :any) {
        // Manejo específico para errores de conectividad de base de datos
        if (error.message && error.message.includes("Can't reach database server")) {
            console.log(`⚠️ TURNO CONTROLLER - Base de datos no disponible para crear turno`);
            return res.status(503).json({ 
                error: 'Servicio temporalmente no disponible',
                message: 'No se puede crear el turno en este momento. Intenta más tarde.' 
            });
        }
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Error de conflicto en la base de datos' });
        }
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

export async function getAllTurnos (req: Request, res: Response) {
    try {
        const allTurnos = await turnoService.getAllTurnos();
        res.status(200).json({
            turnos: allTurnos
        })
    } catch (error: any) {
        // Manejo específico para errores de conectividad de base de datos
        if (error.message && error.message.includes("Can't reach database server")) {
            console.log(`⚠️ TURNO CONTROLLER - Base de datos no disponible para obtener todos los turnos`);
            return res.status(200).json({ 
                turnos: [],
                message: 'No se pudieron obtener los turnos en este momento'
            });
        }
        console.error('Error al obtener todos los turnos:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

export async function getTurnoById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        const turno = await turnoService.getTurnoById(idNumber);
        
        if (!turno) {
            return res.status(404).json({ error: 'Turno no encontrado' });
        }
        
        res.status(200).json({
            turno: turno
        });
    } catch (error: any) {
        // Manejo específico para errores de conectividad de base de datos
        if (error.message && error.message.includes("Can't reach database server")) {
            console.log(`⚠️ TURNO CONTROLLER - Base de datos no disponible para obtener turno por ID: ${req.params.id}`);
            return res.status(404).json({ 
                error: 'Turno no encontrado',
                message: 'No se pudo acceder a la información del turno en este momento'
            });
        }
        console.error('Error al obtener turno por ID:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

export async function getTurnosByCancha(req: Request, res: Response) {
    try {
        const canchaId = parseInt(req.params.canchaId);
        console.log(`🔍 Buscando turnos para cancha: ${canchaId}`);
        
        if (isNaN(canchaId)) {
            console.log(`❌ ID de cancha inválido: ${req.params.canchaId}`);
            return res.status(400).json({ error: 'ID de cancha debe ser un número válido' });
        }

        console.log(`📊 Ejecutando consulta getTurnosByCancha para cancha ${canchaId}`);
        const turnos = await turnoService.getTurnosByCancha(canchaId);
        console.log(`✅ Turnos encontrados: ${turnos.length}`);
        
        res.json({
            turnos,
            total: turnos.length,
            message: 'Turnos de la cancha obtenidos'
        });
    } catch (error: any) {
        // Manjo específico para errores de conectividad de base de datos
        if (error.message && error.message.includes("Can't reach database server")) {
            console.log(`⚠️ TURNO CONTROLLER - Base de datos no disponible para cancha ${req.params.canchaId}, devolviendo lista vacía`);
            return res.status(200).json({
                turnos: [],
                total: 0,
                message: 'Servicio temporalmente no disponible'
            });
        }
        console.error(`❌ Error en getTurnosByCancha para cancha ${req.params.canchaId}:`, error);
        console.error(`❌ Stack trace:`, error.stack);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

export async function updateTurno(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        const updateData = req.body;
        
        const updatedTurno = await turnoService.updateTurno(idNumber, updateData);
        
        res.status(200).json({
            turno: updatedTurno,
            message: 'Turno actualizado exitosamente'
        });
    } catch (error: any) {
        // Manejo específico para errores de conectividad de base de datos
        if (error.message && error.message.includes("Can't reach database server")) {
            console.log(`⚠️ TURNO CONTROLLER - Base de datos no disponible para actualizar turno ID: ${req.params.id}`);
            return res.status(503).json({ 
                error: 'Servicio temporalmente no disponible',
                message: 'No se puede actualizar el turno en este momento. Intenta más tarde.'
            });
        }
        console.error('Error al actualizar turno:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

export async function deleteTurno(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        
        await turnoService.deleteTurno(idNumber);
        
        res.status(200).json({
            message: 'Turno eliminado exitosamente'
        });
    } catch (error: any) {
        // Manejo específico para errores de conectividad de base de datos
        if (error.message && error.message.includes("Can't reach database server")) {
            console.log(`⚠️ TURNO CONTROLLER - Base de datos no disponible para eliminar turno ID: ${req.params.id}`);
            return res.status(503).json({ 
                error: 'Servicio temporalmente no disponible',
                message: 'No se puede eliminar el turno en este momento. Intenta más tarde.'
            });
        }
        console.error('Error al eliminar turno:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

export async function getTurnosDisponiblesHoy(req: Request, res: Response) {
    try {
        const canchaId = parseInt(req.params.canchaId);
        console.log(`🔍 Buscando turnos disponibles hoy para cancha: ${canchaId}`);
        
        if (isNaN(canchaId)) {
            console.log(`❌ ID de cancha inválido: ${req.params.canchaId}`);
            return res.status(400).json({ error: 'ID de cancha debe ser un número válido' });
        }

        console.log(`📊 Ejecutando consulta getTurnosDisponiblesHoy para cancha ${canchaId}`);
        const turnos = await turnoService.getTurnosDisponiblesHoy(canchaId);
        console.log(`✅ Turnos disponibles hoy encontrados: ${turnos.length}`);
        
        res.json({
            turnos,
            total: turnos.length,
            message: 'Turnos disponibles de hoy obtenidos'
        });
    } catch (error: any) {
        // Manejo específico para errores de conectividad de base de datos
        if (error.message && error.message.includes("Can't reach database server")) {
            console.log(`⚠️ TURNO CONTROLLER - Base de datos no disponible para turnos disponibles hoy cancha ${req.params.canchaId}, devolviendo lista vacía`);
            return res.status(200).json({
                turnos: [],
                total: 0,
                message: 'Servicio temporalmente no disponible'
            });
        }
        console.error(`❌ Error en getTurnosDisponiblesHoy para cancha ${req.params.canchaId}:`, error);
        console.error(`❌ Stack trace:`, error.stack);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}


