import { Request, Response,NextFunction } from "express";
import { createOwner } from "../services/owner.service";

export const createOwnerr = async (req:Request, res:Response,next: NextFunction) => {
    try{
        const nuevoOwner = await createOwner(req.body);
        res.status(200).json(nuevoOwner);
    }catch(error){
        next(error);
    }
}