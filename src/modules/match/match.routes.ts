import { Router } from 'express';
import { createMatchHandler, getMatchesForRequestHandler, getMyMatchesHandler } from './match.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.post('/', authenticate, authorize('ADMIN'), createMatchHandler);
router.get('/my', authenticate, authorize('DONOR'), getMyMatchesHandler);
router.get('/request/:requestId', authenticate, authorize('REQUESTER', 'ADMIN'), getMatchesForRequestHandler);

export default router;
