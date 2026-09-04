import { Router } from 'express';
import { register, login, refreshToken, googleAuth } from './auth.controller';
import { validate } from '../../middleware/validate';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.validation';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);
router.post('/google', googleAuth);

export default router;
