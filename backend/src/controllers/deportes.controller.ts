import { NextFunction, Request, Response } from 'express';
import { CreateDeporteResquest, UpdateDeporteResquest, DeporteListResponse, DeporteResponse} from '../types/deporte.types';
import * as deportesService  from '../services/deportes.service';

export async function getAllDeportes (req: Request, res: Response<DeporteListResponse>, next: NextFunction) {
    try {
        const deportes = await deportesService.getAllDeportes();
        console.log('🔍 DEBUG - deportes[0]:', JSON.stringify(deportes[0]));
        res.json({
            deportes,
            total: deportes.length
        })
    } catch (error) {
        // Manejo específico para errores de conectividad de base de datos
        if (error.message && error.message.includes("Can't reach database server")) {
            console.log('⚠️ DEPORTES CONTROLLER - Base de datos no disponible, devolviendo lista vacía');
            return res.status(200).json({
                deportes: [],
                total: 0,
                message: 'Servicio temporalmente no disponible'
            });
        }
        next(error);
    }
};

export async function getDeporteById (req: Request, res: Response<DeporteResponse>, next: NextFunction) {
    try {
        const { id } = req.params;
        const deporte= await deportesService.getDeporteById(parseInt(id));
        res.json({
            deporte,
            message:'Deporte retrieved successfully'
        })
    } catch (error) {
        next(error);
    }
}

export async function createDeporte(req : Request<{},DeporteResponse , CreateDeporteResquest>, res: Response<DeporteResponse>, next: NextFunction){
    try {
        const newDeporte = await deportesService.createDeporte(req.body);
        res.status(201).json({
            deporte: newDeporte,
            message: 'Deporte created successfully'
        });
    } catch (error) {
        next(error);
    }
}

export async function updateDeporte(req: Request<{id:string}, DeporteResponse,UpdateDeporteResquest>, res: Response<DeporteResponse>, next: NextFunction){
    try {
        const { id } = req.params;
        const updateDeporte = await deportesService.updateDeporte(parseInt(id),req.body);
        res.json({
            deporte: updateDeporte,
            message: 'Deporte updated successfully'
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteDeporte(req: Request, res: Response, next: NextFunction){
    try {
        const { id } = req.params;
        await deportesService.deleteDeporte(parseInt(id));
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}
