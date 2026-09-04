import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, refreshAccessToken } from './auth.service';
import { googleLogin } from './google.service';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.validation';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../utils/AppError';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError('Validation failed', 400, parsed.error.errors.map(e => e.message));
    const { name, email, password, role, phone } = parsed.data;
    const result = await registerUser(name, email, password, role, phone);
    sendSuccess(res, 201, 'Registration successful', result);
  } catch (err) { next(err); }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError('Validation failed', 400, parsed.error.errors.map(e => e.message));
    const result = await loginUser(parsed.data.email, parsed.data.password);
    sendSuccess(res, 200, 'Login successful', result);
  } catch (err) { next(err); }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = refreshTokenSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError('Validation failed', 400, parsed.error.errors.map(e => e.message));
    const result = refreshAccessToken(parsed.data.refreshToken);
    sendSuccess(res, 200, 'Token refreshed', result);
  } catch (err) { next(err); }
};

export const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idToken } = req.body;
    if (!idToken) throw new AppError('Google ID token is required', 400);
    const result = await googleLogin(idToken);
    sendSuccess(res, 200, 'Google login successful', result);
  } catch (err) { next(err); }
};
