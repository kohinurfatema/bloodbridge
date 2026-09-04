import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { getAuditLogs, getAuditLogById } from './audit.service';
import { sendSuccess } from '../../utils/response';

export const listAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const { userId, action, entity } = req.query as Record<string, string>;
    const data = await getAuditLogs({ userId, action, entity, page, limit });
    sendSuccess(res, 200, 'Audit logs retrieved', data);
  } catch (err) { next(err); }
};

export const getAuditLogByIdHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await getAuditLogById(req.params.id);
    sendSuccess(res, 200, 'Audit log retrieved', data);
  } catch (err) { next(err); }
};
