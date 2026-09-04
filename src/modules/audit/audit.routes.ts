import { Router } from 'express';
import { listAuditLogs, getAuditLogByIdHandler } from './audit.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), listAuditLogs);
router.get('/:id', authenticate, authorize('ADMIN'), getAuditLogByIdHandler);

export default router;
