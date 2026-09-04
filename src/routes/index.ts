import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import userRoutes from '../modules/user/user.routes';
import donorRoutes from '../modules/donor/donor.routes';
import bloodRequestRoutes from '../modules/bloodRequest/bloodRequest.routes';
import matchRoutes from '../modules/match/match.routes';
import alertRoutes from '../modules/alert/alert.routes';
import paymentRoutes from '../modules/payment/payment.routes';
import auditRoutes from '../modules/audit/audit.routes';
import adminRoutes from '../modules/admin/admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/donors', donorRoutes);
router.use('/requests', bloodRequestRoutes);
router.use('/matches', matchRoutes);
router.use('/alerts', alertRoutes);
router.use('/payments', paymentRoutes);
router.use('/audit', auditRoutes);
router.use('/admin', adminRoutes);

export default router;
