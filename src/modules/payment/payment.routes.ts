import { Router } from 'express';
import { initiatePaymentHandler, verifyPaymentHandler, getMyPaymentsHandler } from './payment.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.post('/initiate', authenticate, authorize('REQUESTER'), initiatePaymentHandler);
router.get('/verify', authenticate, verifyPaymentHandler);
router.get('/my', authenticate, authorize('REQUESTER'), getMyPaymentsHandler);

export default router;
