import { Request, Response } from 'express';
import * as mpService from '../services/mercadopduenio.service';

// (req as any).user.id viene de tu authMiddleware (JWT)
export async function crearLinkConexion(req: Request, res: Response) {
    try {
        const usuarioId = (req as any).user.id; 
        const { authUrl } = await mpService.generarUrlConexion(usuarioId);
        res.json({ authUrl });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function autorizarConexion(req: Request, res: Response) {
    try {
        const { code, state } = req.body;
    if (!code || !state) {
        return res.status(400).json({ error: 'Faltan parámetros code o state' });
    }
    await mpService.autorizarConexion(code, state);
        res.json({ ok: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
