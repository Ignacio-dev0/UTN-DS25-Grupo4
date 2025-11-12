import { Request, Response } from 'express';
import * as mpService from '../services/mercadopduenio.service';

export async function crearLinkConexion(req: Request, res: Response) {
    try {
        // --- LA CORRECCIÓN ESTÁ AQUÍ ---
        // Cambiamos (req as any).user.id por (req as any).usuario.id
        const usuarioId = (req as any).usuario.id; 
        // --- FIN DE LA CORRECCIÓN ---

        if (!usuarioId) {
            throw new Error("No se pudo identificar al usuario desde el token.");
        }
        
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