import { Router } from 'express';
import { createAlertHandler, listAlertsHandler, resolveAlertHandler } from './alert.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.post('/', authenticate, authorize('ADMIN'), createAlertHandler);
router.get('/', authenticate, listAlertsHandler);
router.patch('/:id/resolve', authenticate, authorize('ADMIN'), resolveAlertHandler);

export default router;
