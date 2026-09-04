import { Router } from 'express';
import { getDashboardStatsHandler, listUsersHandler, toggleUserStatusHandler, deleteUserHandler } from './admin.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/stats', getDashboardStatsHandler);
router.get('/users', listUsersHandler);
router.patch('/users/:id/status', toggleUserStatusHandler);
router.delete('/users/:id', deleteUserHandler);

export default router;
