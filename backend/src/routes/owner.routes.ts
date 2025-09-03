import { Router } from "express";

import { createOwnerr } from "../controllers/owner.controller";

const router = Router();

router.post('/', createOwnerr);

export default router;