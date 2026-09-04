import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { createEmergencyAlert, listAlerts, resolveAlert } from './alert.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../utils/AppError';

export const createAlertHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { requestId, message } = req.body;
    if (!requestId) throw new AppError('requestId is required', 400);
    const data = await createEmergencyAlert(requestId, message);
    sendSuccess(res, 201, 'Emergency alert created', data);
  } catch (err) { next(err); }
};

export const listAlertsHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const onlyActive = req.query.active === 'true';
    const data = await listAlerts(page, limit, onlyActive);
    sendSuccess(res, 200, 'Emergency alerts retrieved', data);
  } catch (err) { next(err); }
};

export const resolveAlertHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await resolveAlert(req.params.id);
    sendSuccess(res, 200, 'Alert resolved', data);
  } catch (err) { next(err); }
};
