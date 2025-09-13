import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import  * as soliServ  from "../services/solicitud.service";

// Configuración de multer para imágenes de solicitudes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../frontend/public/images/solicitudes'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'solicitud-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB límite
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

export const uploadMiddleware = upload.single('imagen');

export const createRequest =  async (req: Request, res:Response, next:NextFunction) =>{
    try{
        const nuevaSolicitud = await soliServ.createSolicitud(req.body);
        res.status(200).json(nuevaSolicitud);
    }catch(error){
        next(error);
    }
}

export const createRequestWithImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('BODY RECIBIDO EN /admin/solicitudes/with-image:', req.body);
        const { usuarioId, cuit, nombreComplejo, calle, altura, localidadId } = req.body;
        const imagePath = req.file ? `/images/solicitudes/${req.file.filename}` : null;

        // Validaciones explícitas
        if (!usuarioId || isNaN(parseInt(usuarioId))) {
            return res.status(400).json({ error: 'usuarioId inválido o faltante' });
        }
        if (!cuit || !/^\d{2}-\d{8}-\d{1}$/.test(cuit)) {
            return res.status(400).json({ error: 'CUIT inválido. Formato esperado: XX-XXXXXXXX-X' });
        }
        if (!nombreComplejo) {
            return res.status(400).json({ error: 'nombreComplejo faltante' });
        }
        if (!calle) {
            return res.status(400).json({ error: 'calle faltante' });
        }
        if (!altura || isNaN(parseInt(altura))) {
            return res.status(400).json({ error: 'altura inválida o faltante' });
        }
        if (!localidadId || isNaN(parseInt(localidadId))) {
            return res.status(400).json({ error: 'localidadId inválido o faltante' });
        }

        const solicitudData = {
            usuarioId: parseInt(usuarioId),
            cuit,
            complejo: {
                nombre: nombreComplejo,
                imagen: imagePath,
                domicilio: {
                    calle,
                    altura,
                    localidad: localidadId // Pasar el ID directamente
                }
            }
        };

        const nuevaSolicitud = await soliServ.createSolicitudWithComplejo(solicitudData);
        res.status(201).json({
            solicitud: nuevaSolicitud,
            message: 'Solicitud creada correctamente'
        });
    } catch (error) {
        console.error('ERROR EN /admin/solicitudes/with-image:', error);
        next(error);
    }
};

export const updateReq = async(req:Request, res:Response, next:NextFunction)=>{
    try{
        const {id}=req.params;
        const soliup = await soliServ.updateSolicitud(parseInt(id),req.body);
        res.json({
            solicitud: soliup,
            message: ('solicitud actualizada correctamente'),
        })
    }catch(error:any){
        console.log(error);
    }
}

export async function getSolById(req:Request, res:Response) {
    try{
        const {id}=req.params;
        const solicitud = await soliServ.getRequestById(parseInt(id));
        res.json({
            solicitud,
            message:('request retrieved succesfully')
        });
    }catch(error:any){
        console.log(error);
    }
}

export async function getAllSol(req:Request, res:Response){
    try{
        const solicitudes = await soliServ.getAllRequest();
        res.json({
            solicitudes,
            total: solicitudes.length
        })
    }catch(error:any){
        console.log(error);
    }
}

export async function eliminarSoli (req: Request, res: Response){
  try {
    const {id} = req.params;
    const deleted = await soliServ.deleteSoli(parseInt(id));
    res.json({ usuario:deleted, message: "solicitud deleteada " });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};



// // backend/src/controllers/solicitud.controller.ts
// import { Request, Response } from 'express';
// import * as solicitudService from '../services/solicitud.service';

// export const crearSolicitud = async (req: Request, res: Response) => {
// 	try {
// 		const nuevaSolicitud = await solicitudService.crearSolicitud(req.body);
// 		res.status(201).json(nuevaSolicitud);
// 	} catch (error: any) {
// 		res.status(400).json({ error: error.message });
// 	}
// };

// export const obtenerSolicitudes = async (req: Request, res: Response) => {
// 	try {
// 		const solicitudes = ( req.query.estado == "PENDIENTE" )?
// 			( await solicitudService.obtenerSolicitudesPendientes() ):
// 			( await solicitudService.obtenerSolicitudes() );
// 		res.status(200).json(solicitudes);

// 	} catch (error: any) {
// 		res.status(500).json({ error: 'Error al obtener las solicitudes.' });
// 	}
// };

// export const obtenerSolicitudPorId = async (req: Request, res: Response) => {
// 	try {
// 		const id = Number(req.params.id);
// 		const solicitud = await solicitudService.obtenerSolicitudPorId(id);
// 		if (!solicitud) {
// 			return res.status(404).json({ error: 'Solicitud no encontrada.' });
// 		}
// 		res.status(200).json(solicitud);
// 	} catch (error: any) {
// 		res.status(500).json({ error: 'Error al obtener la solicitud.' });
// 	}
// };

// export const evaluarSolicitud = async (req: Request, res: Response) => {
// 	try {
// 		const id = Number(req.params.id);
// 		const data = req.body;

// 		const solicitud = await solicitudService.evaluarSolicitud(id, data.solicitud, data.emisorId);
// 		if (!solicitud) {
// 			return res.status(404).json({ error: 'Solicitud no encontrada.' });
// 		}
// 		res.status(200).json(solicitud);
// 	} catch (error: any) {
// 		res.status(500).json({ error: 'Error al obtener la solicitud.' });
// 	}
// }
