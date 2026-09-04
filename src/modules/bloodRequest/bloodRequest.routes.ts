import { Router } from 'express';
import {
  createRequest,
  listRequests,
  getMyRequests,
  getRequestById,
  updateStatus,
  deleteRequest,
} from './bloodRequest.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate, validateQuery } from '../../middleware/validate';
import { createRequestSchema, listRequestsQuerySchema } from './bloodRequest.validation';

const router = Router();

router.post('/', authenticate, authorize('REQUESTER'), validate(createRequestSchema), createRequest);
router.get('/', authenticate, validateQuery(listRequestsQuerySchema), listRequests);
router.get('/my', authenticate, authorize('REQUESTER'), getMyRequests);
router.get('/:id', authenticate, getRequestById);
router.patch('/:id/status', authenticate, authorize('REQUESTER', 'ADMIN'), updateStatus);
router.delete('/:id', authenticate, authorize('REQUESTER', 'ADMIN'), deleteRequest);

export default router;
