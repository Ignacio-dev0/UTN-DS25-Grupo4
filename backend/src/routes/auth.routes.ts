import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { loginSchema, registroSchema } from '../validations/auth.validation';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.post('/register', validate(registroSchema), authController.register);

export default router;