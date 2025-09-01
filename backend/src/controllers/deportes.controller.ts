// backend/src/controllers/deportes.controller.ts
import { NextFunction, Request, Response } from 'express';
import { CreateDeporteResquest, UpdateDeporteResquest, DeporteListResponse, DeporteResponse} from '../types/deporte.types';
import * as deportesService  from '../services/deportes.service';

export async function getAllDeportes (req: Request, res: Response<DeporteListResponse>, next: NextFunction) {
    try {
        const deportes = await deportesService.getAllDeportes();
        res.json({
            deportes,
            total: deportes.length
        })
    } catch (error) {
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

export async function createDeporte(req : Request<{},DeporteResponse , CreateDeporteResquest>, res: Response<DeporteResponse>){
    try {
        const newDeporte = await deportesService.createDeporte(req.body);
        res.status(201).json({
            deporte: newDeporte,
            message: 'Deporte created successfully'
        });
    } catch (error) {
        console.log(error);
    }
}

export async function updateDeporte(req: Request<{id:string}, DeporteResponse,UpdateDeporteResquest>, res: Response<DeporteResponse>){
    try {
        const { id } = req.params;
        const updateDeporte = await deportesService.updateDeporte(parseInt(id),req.body);
        res.json({
            deporte: updateDeporte,
            message: 'Deporte updated successfully'
        });
    }catch(error){
        console.log(error);
    }
}

export async function deleteDeporte(req: Request<{id:string}, {}, {}>, res: Response) {
    try {
        const { id } = req.params;
        await deportesService.deleteDeporte(parseInt(id));
        res.json({
            message: 'Deporte deleted successfully'
        });
    } catch (error) {
        console.log(error);
    }
}