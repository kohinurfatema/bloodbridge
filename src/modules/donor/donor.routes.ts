import { Router } from 'express';
import {
  registerDonorHandler,
  getMyDonorProfileHandler,
  updateMyDonorProfileHandler,
  searchDonorsHandler,
} from './donor.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.get('/', authenticate, searchDonorsHandler);
router.post('/register', authenticate, authorize('DONOR'), registerDonorHandler);
router.get('/me', authenticate, authorize('DONOR'), getMyDonorProfileHandler);
router.patch('/me', authenticate, authorize('DONOR'), updateMyDonorProfileHandler);

export default router;
