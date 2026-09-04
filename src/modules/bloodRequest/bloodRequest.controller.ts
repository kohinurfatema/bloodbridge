import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import {
  createBloodRequest,
  listBloodRequests,
  getMyBloodRequests,
  getBloodRequestById,
} from './bloodRequest.service';
import { createRequestSchema, listRequestsQuerySchema } from './bloodRequest.validation';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../utils/AppError';

export const createRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = createRequestSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError('Validation failed', 400, parsed.error.errors.map(e => e.message));
    const data = await createBloodRequest(req.user!.id, parsed.data);
    sendSuccess(res, 201, 'Blood request created', data);
  } catch (err) { next(err); }
};

export const listRequests = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = listRequestsQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new AppError('Invalid query parameters', 400, parsed.error.errors.map(e => e.message));
    const data = await listBloodRequests(parsed.data as any);
    sendSuccess(res, 200, 'Blood requests retrieved', data);
  } catch (err) { next(err); }
};

export const getMyRequests = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await getMyBloodRequests(req.user!.id, page, limit);
    sendSuccess(res, 200, 'Your blood requests retrieved', data);
  } catch (err) { next(err); }
};

export const getRequestById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await getBloodRequestById(req.params.id);
    sendSuccess(res, 200, 'Blood request retrieved', data);
  } catch (err) { next(err); }
};
