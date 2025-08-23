// backend/src/controllers/deportes.controller.ts
import { Request, Response } from 'express';
import deportesService from '../services/deportes.service';

const getAllDeportes = async (req: Request, res: Response) => {
    try {
        const deportes = await deportesService.getAll();
        res.status(200).json(deportes);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los deportes.' });
    }
};

const createDeporte = async (req: Request, res: Response) => {
    try {
        // El tipo del body también es validado
        const nuevoDeporte = await deportesService.create(req.body);
        res.status(201).json(nuevoDeporte);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el deporte.' });
    }
};

export default {
    getAllDeportes,
    createDeporte,
};