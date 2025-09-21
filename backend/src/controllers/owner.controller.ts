import { Request, Response,NextFunction } from "express";
// import { createOwner } from "../services/owner.service";

export const createOwnerr = async (req:Request, res:Response,next: NextFunction) => {
    try{
        // TODO: Implementar funcionalidad de owner o usar usuario con rol DUENIO
        // const nuevoOwner = await createOwner(req.body);
        res.status(501).json({ message: "Funcionalidad no implementada - usar usuario con rol DUENIO" });
    }catch(error){
        next(error);
    }
}