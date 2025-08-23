// backend/src/controllers/resenas.controller.ts
import { Request, Response } from 'express';
import resenasService from '../services/resenas.service';

const getResenasByCancha = async (req: Request, res: Response) => {
    try {
        const canchaId = parseInt(req.params.canchaId);
        const resenas = await resenasService.getByCanchaId(canchaId);
        res.status(200).json(resenas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las reseñas.' });
    }
};

const createResena = async (req: Request, res: Response) => {
    try {
        const nuevaResena = await resenasService.create(req.body);
        res.status(201).json(nuevaResena);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la reseña.' });
    }
};

export default {
    getResenasByCancha,
    createResena,
};