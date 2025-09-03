import { Request, Response, NextFunction } from "express";

import { crearLocalidad } from "../services/localidad.service";

export const crearLoc = async (req: Request, res: Response, next: NextFunction) =>{
    try{
        const nuevaLoc = await crearLocalidad(req.body);
        res.status(201).json(nuevaLoc);
    }catch(error){
        next(error);
    }
}