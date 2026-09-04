import { Router } from 'express';
import {
  registerDonorHandler,
  getMyDonorProfileHandler,
  updateMyDonorProfileHandler,
  searchDonorsHandler,
} from './donor.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { registerDonorSchema, updateDonorSchema } from './donor.validation';

const router = Router();

router.get('/', authenticate, searchDonorsHandler);
router.post('/register', authenticate, authorize('DONOR'), validate(registerDonorSchema), registerDonorHandler);
router.get('/me', authenticate, authorize('DONOR'), getMyDonorProfileHandler);
router.patch('/me', authenticate, authorize('DONOR'), validate(updateDonorSchema), updateMyDonorProfileHandler);

export default router;
