import { Router } from "express";
import { crearLoc } from "../controllers/localidad.controller";

const router = Router();

router.post('/', crearLoc);

export default router;