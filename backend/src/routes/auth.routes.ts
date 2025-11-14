import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import * as passwordResetController from '../controllers/passwordReset.controller';
import validate from '../middlewares/validate';
import { loginSchema, registroSchema } from '../validations/auth.validation';
import {
	solicitarCodigoSchema,
	resetearPasswordSchema,
} from '../validations/passwordReset.validation';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.post('/register', validate(registroSchema), authController.register);
router.post('/password/forgot', validate(solicitarCodigoSchema), passwordResetController.solicitarCodigo);
router.post('/password/reset', validate(resetearPasswordSchema), passwordResetController.resetear);

export default router;