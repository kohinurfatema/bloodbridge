import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { initiatePayment, getMyPayments } from './payment.service';
import { initiatePaymentSchema } from './payment.validation';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../utils/AppError';

export const initiatePaymentHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = initiatePaymentSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError('Validation failed', 400, parsed.error.errors.map(e => e.message));
    const { requestId, amount, currency } = parsed.data;
    const data = await initiatePayment(req.user!.id, requestId, amount, currency);
    sendSuccess(res, 201, 'Payment session created', data);
  } catch (err) { next(err); }
};

export const getMyPaymentsHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await getMyPayments(req.user!.id, page, limit);
    sendSuccess(res, 200, 'Your payments retrieved', data);
  } catch (err) { next(err); }
};
