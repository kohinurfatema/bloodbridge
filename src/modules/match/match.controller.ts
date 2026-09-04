import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { createMatch, getMatchesForRequest, getMyMatches } from './match.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../utils/AppError';

export const createMatchHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { requestId, donorId } = req.body;
    if (!requestId || !donorId) throw new AppError('requestId and donorId are required', 400);
    const data = await createMatch(requestId, donorId, req.user!.id);
    sendSuccess(res, 201, 'Donor matched to blood request', data);
  } catch (err) { next(err); }
};

export const getMatchesForRequestHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await getMatchesForRequest(req.params.requestId, req.user!.id, req.user!.role);
    sendSuccess(res, 200, 'Matches retrieved', data);
  } catch (err) { next(err); }
};

export const getMyMatchesHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await getMyMatches(req.user!.id, page, limit);
    sendSuccess(res, 200, 'Your matches retrieved', data);
  } catch (err) { next(err); }
};
