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

export async function getTurnosPorSemana(req: Request, res: Response) {
    try {
        const canchaId = parseInt(req.params.canchaId);
        const semanaOffset = parseInt(req.params.offset) || 0;
        
        console.log(`🔍 Buscando turnos por semana para cancha: ${canchaId}, offset: ${semanaOffset}`);
        
        if (isNaN(canchaId)) {
            console.log(`❌ ID de cancha inválido: ${req.params.canchaId}`);
            return res.status(400).json({ error: 'ID de cancha debe ser un número válido' });
        }

        console.log(`📊 Ejecutando consulta getTurnosPorSemana para cancha ${canchaId}, semana ${semanaOffset}`);
        const turnos = await turnoService.getTurnosPorSemana(canchaId, semanaOffset);
        console.log(`✅ Turnos encontrados para semana ${semanaOffset}: ${turnos.length}`);
        
        // Agregar el campo 'dia' (día de la semana) a cada turno
        const turnosConDia = turnos.map(turno => {
            // Parsear fecha como componentes locales para evitar problemas de timezone
            const fechaStr = turno.fecha.toISOString().split('T')[0]; // "2025-10-22"
            const [year, month, day] = fechaStr.split('-').map(Number);
            const fecha = new Date(year, month - 1, day); // month es 0-indexed
            
            const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
            const dia = diasSemana[fecha.getDay()]; // getDay() usa timezone local
            
            const turnoFormateado = {
                ...turno,
                dia,
                // Asegurar que deshabilitado siempre tenga un valor (false si es null/undefined)
                deshabilitado: turno.deshabilitado ?? false
            };
            
            // Debug: loguear turnos deshabilitados
            if (turnoFormateado.deshabilitado) {
                console.log(`🟠 Turno deshabilitado encontrado: ID ${turno.id}, ${dia} ${turno.horaInicio}`);
            }
            
            return turnoFormateado;
        });
        
        res.json({
            turnos: turnosConDia,
            total: turnosConDia.length,
            semanaOffset,
            message: `Turnos de semana ${semanaOffset} obtenidos`
        });
    } catch (error: any) {
        // Manejo específico para errores de conectividad de base de datos
        if (error.message && error.message.includes("Can't reach database server")) {
            console.log(`⚠️ TURNO CONTROLLER - Base de datos no disponible para obtener turnos por semana de cancha: ${req.params.canchaId}`);
            return res.status(200).json({ 
                turnos: [],
                total: 0,
                semanaOffset: parseInt(req.params.offset) || 0,
                message: 'No se pudieron obtener los turnos en este momento'
            });
        }
        console.error('Error al obtener turnos por semana:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

export async function getTurnosDisponiblesPorSemana(req: Request, res: Response) {
    try {
        const canchaId = parseInt(req.params.canchaId);
        const semanaOffset = parseInt(req.params.offset) || 0;
        
        console.log(`🔍 Buscando turnos DISPONIBLES por semana para cancha: ${canchaId}, offset: ${semanaOffset}`);
        
        if (isNaN(canchaId)) {
            console.log(`❌ ID de cancha inválido: ${req.params.canchaId}`);
            return res.status(400).json({ error: 'ID de cancha debe ser un número válido' });
        }

        const turnos = await turnoService.getTurnosPorSemana(canchaId, semanaOffset);
        
        // Filtrar solo turnos disponibles
        const turnosDisponibles = turnos.filter(turno => !turno.reservado && !turno.alquilerId);
        
        // Agregar el campo 'dia' a cada turno
        const turnosConDia = turnosDisponibles.map(turno => {
            // Parsear fecha como componentes locales para evitar problemas de timezone
            const fechaStr = turno.fecha.toISOString().split('T')[0]; // "2025-10-22"
            const [year, month, day] = fechaStr.split('-').map(Number);
            const fecha = new Date(year, month - 1, day); // month es 0-indexed
            
            const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
            const dia = diasSemana[fecha.getDay()]; // getDay() usa timezone local
            
            return {
                ...turno,
                dia
            };
        });
        
        res.json({
            turnos: turnosConDia,
            total: turnosConDia.length,
            semanaOffset,
            message: `Turnos disponibles de semana ${semanaOffset} obtenidos`
        });
    } catch (error: any) {
        console.error('Error al obtener turnos disponibles por semana:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

export async function getTurnosDisponiblesHoy(req: Request, res: Response) {
    try {
        const canchaId = parseInt(req.params.canchaId);
        
        if (isNaN(canchaId)) {
            return res.status(400).json({ error: 'ID de cancha debe ser un número válido' });
        }

        const turnos = await turnoService.getTurnosByCancha(canchaId);
        
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        const turnosHoy = turnos.filter(turno => {
            const fechaTurno = new Date(turno.fecha);
            fechaTurno.setHours(0, 0, 0, 0);
            return fechaTurno.getTime() === hoy.getTime() && !turno.reservado;
        });
        
        res.json({
            turnos: turnosHoy,
            total: turnosHoy.length,
            message: 'Turnos disponibles de hoy obtenidos'
        });
    } catch (error: any) {
        console.error('Error al obtener turnos disponibles de hoy:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

export async function deshabilitarTurno(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID debe ser un número válido' });
        }

        const turno = await turnoService.getTurnoById(id);
        if (!turno) {
            return res.status(404).json({ error: 'Turno no encontrado' });
        }

        // Deshabilitar el turno temporalmente
        const turnoActualizado = await turnoService.updateTurno(id, { deshabilitado: true });
        
        console.log(`⏸️ Turno ${id} deshabilitado temporalmente`);
        
        res.json({
            message: 'Turno deshabilitado temporalmente exitosamente',
            turno: turnoActualizado
        });
    } catch (error: any) {
        console.error('Error al deshabilitar turno:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

export async function habilitarTurno(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID debe ser un número válido' });
        }

        const turno = await turnoService.getTurnoById(id);
        if (!turno) {
            return res.status(404).json({ error: 'Turno no encontrado' });
        }

        // Habilitar el turno (quitar deshabilitación temporal)
        const turnoActualizado = await turnoService.updateTurno(id, { deshabilitado: false });
        
        console.log(`▶️ Turno ${id} habilitado nuevamente`);
        
        res.json({
            message: 'Turno habilitado exitosamente',
            turno: turnoActualizado
        });
    } catch (error: any) {
        console.error('Error al habilitar turno:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

