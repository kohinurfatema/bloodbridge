import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { listAllUsers, toggleUserStatus, softDeleteUser } from './admin.service';
import { sendSuccess } from '../../utils/response';

export const listUsersHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { role, search } = req.query as Record<string, string>;
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
    const data = await listAllUsers({ role, isActive, search, page, limit });
    sendSuccess(res, 200, 'Users retrieved', data);
  } catch (err) { next(err); }
};

export const toggleUserStatusHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await toggleUserStatus(req.params.id, req.user!.id);
    const msg = data.isActive ? 'User activated' : 'User deactivated';
    sendSuccess(res, 200, msg, data);
  } catch (err) { next(err); }
};

export const deleteUserHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await softDeleteUser(req.params.id, req.user!.id);
    sendSuccess(res, 200, 'User deleted', {});
  } catch (err) { next(err); }
};
