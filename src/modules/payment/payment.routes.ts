import { Router } from 'express';
import { initiatePaymentHandler, getMyPaymentsHandler } from './payment.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.post('/initiate', authenticate, authorize('REQUESTER'), initiatePaymentHandler);
router.get('/my', authenticate, authorize('REQUESTER'), getMyPaymentsHandler);

export default router;
