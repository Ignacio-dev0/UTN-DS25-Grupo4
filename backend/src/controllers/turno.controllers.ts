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
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Error de conflicto en la base de datos' });
        }
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

export async function getAllTurnos(req : Request ,res: Response) {
    try {
        const turnos = await turnoService.getAllTurnos();
        res.json({
            turnos,
            total: turnos.length
        })
    } catch (error : any) {
        return res.status(500).json({error : 'Error interno del servidor.'});
    }
}

export async function getTurnoById(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID debe ser un número válido' });
        }

        const turno = await turnoService.getTurnoById(id);
        if (!turno) {
            return res.status(404).json({ error: 'Turno no encontrado' });
        }

        res.json({
            turno,
            message: 'Turno encontrado'
        });
    } catch (error: any) {
        return res.status(500).json({ error: 'Error interno del servidor.' });
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
        console.error(`❌ Error en getTurnosByCancha para cancha ${req.params.canchaId}:`, error);
        console.error(`❌ Stack trace:`, error.stack);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

export async function updateTurno(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID debe ser un número válido' });
        }

        const updatedTurno = await turnoService.updateTurno(id, req.body);
        res.json({
            turno: updatedTurno,
            message: 'Turno actualizado correctamente'
        });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Turno no encontrado' });
        }
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

export async function deleteTurno(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID debe ser un número válido' });
        }

        const deletedTurno = await turnoService.deleteTurno(id);
        res.json({
            turno: deletedTurno,
            message: 'Turno eliminado correctamente'
        });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Turno no encontrado' });
        }
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

