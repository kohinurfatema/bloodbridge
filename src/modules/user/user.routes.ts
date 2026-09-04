import { Router } from 'express';
import { getMe, updateMe, getUserByIdHandler } from './user.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, updateMe);
router.get('/:id', authenticate, authorize('ADMIN'), getUserByIdHandler);

export default router;
