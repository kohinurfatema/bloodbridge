import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import userRoutes from '../modules/user/user.routes';
import donorRoutes from '../modules/donor/donor.routes';
import bloodRequestRoutes from '../modules/bloodRequest/bloodRequest.routes';
import matchRoutes from '../modules/match/match.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/donors', donorRoutes);
router.use('/requests', bloodRequestRoutes);
router.use('/matches', matchRoutes);

export default router;
