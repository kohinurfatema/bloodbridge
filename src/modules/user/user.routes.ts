import { Router } from 'express';
import { getMe, updateMe, getUserByIdHandler } from './user.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { updateProfileSchema } from './user.validation';

const router = Router();

router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, validate(updateProfileSchema), updateMe);
router.get('/:id', authenticate, authorize('ADMIN'), getUserByIdHandler);

export default router;
