import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { getMyProfile, updateMyProfile, getUserById } from './user.service';
import { updateProfileSchema } from './user.validation';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../utils/AppError';

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await getMyProfile(req.user!.id);
    sendSuccess(res, 200, 'Profile retrieved', data);
  } catch (err) { next(err); }
};

export const updateMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError('Validation failed', 400, parsed.error.errors.map(e => e.message));
    const data = await updateMyProfile(req.user!.id, parsed.data);
    sendSuccess(res, 200, 'Profile updated', data);
  } catch (err) { next(err); }
};

export const getUserByIdHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await getUserById(req.params.id);
    sendSuccess(res, 200, 'User retrieved', data);
  } catch (err) { next(err); }
};
