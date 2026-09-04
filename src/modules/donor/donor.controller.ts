import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { registerDonor, getMyDonorProfile, updateMyDonorProfile, searchDonors } from './donor.service';
import { registerDonorSchema, updateDonorSchema } from './donor.validation';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../utils/AppError';

export const registerDonorHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = registerDonorSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError('Validation failed', 400, parsed.error.errors.map(e => e.message));
    const data = await registerDonor(req.user!.id, parsed.data);
    sendSuccess(res, 201, 'Donor profile created', data);
  } catch (err) { next(err); }
};

export const getMyDonorProfileHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await getMyDonorProfile(req.user!.id);
    sendSuccess(res, 200, 'Donor profile retrieved', data);
  } catch (err) { next(err); }
};

export const updateMyDonorProfileHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = updateDonorSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError('Validation failed', 400, parsed.error.errors.map(e => e.message));
    const data = await updateMyDonorProfile(req.user!.id, parsed.data);
    sendSuccess(res, 200, 'Donor profile updated', data);
  } catch (err) { next(err); }
};

export const searchDonorsHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { bloodType, location, isAvailable, page, limit, sortBy, sortOrder } = req.query as Record<string, string>;
    const result = await searchDonors({
      bloodType,
      location,
      isAvailable: isAvailable !== undefined ? isAvailable === 'true' : undefined,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
    });
    sendSuccess(res, 200, 'Donors retrieved', result);
  } catch (err) { next(err); }
};
