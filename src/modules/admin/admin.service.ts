import prisma from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { logAudit } from '../../utils/auditLogger';

export const getDashboardStats = async () => {
  const [
    totalUsers,
    donors,
    requesters,
    admins,
    totalRequests,
    pendingRequests,
    matchedRequests,
    fulfilledRequests,
    cancelledRequests,
    totalMatches,
    completedMatches,
    totalAlerts,
    unresolvedAlerts,
    totalPayments,
    completedPayments,
    recentRequests,
    recentMatches,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { role: 'DONOR', deletedAt: null } }),
    prisma.user.count({ where: { role: 'REQUESTER', deletedAt: null } }),
    prisma.user.count({ where: { role: 'ADMIN', deletedAt: null } }),
    prisma.bloodRequest.count({ where: { deletedAt: null } }),
    prisma.bloodRequest.count({ where: { status: 'PENDING', deletedAt: null } }),
    prisma.bloodRequest.count({ where: { status: 'MATCHED', deletedAt: null } }),
    prisma.bloodRequest.count({ where: { status: 'FULFILLED', deletedAt: null } }),
    prisma.bloodRequest.count({ where: { status: 'CANCELLED', deletedAt: null } }),
    prisma.donationMatch.count(),
    prisma.donationMatch.count({ where: { status: 'COMPLETED' } }),
    prisma.emergencyAlert.count(),
    prisma.emergencyAlert.count({ where: { isResolved: false } }),
    prisma.payment.count(),
    prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true }, _count: true }),
    prisma.bloodRequest.findMany({
      where: { deletedAt: null },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, patientName: true, bloodType: true, urgency: true, status: true, createdAt: true },
    }),
    prisma.donationMatch.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        request: { select: { patientName: true, bloodType: true } },
        donor: { select: { user: { select: { name: true } } } },
      },
    }),
  ]);

  return {
    users: { total: totalUsers, donors, requesters, admins },
    bloodRequests: { total: totalRequests, pending: pendingRequests, matched: matchedRequests, fulfilled: fulfilledRequests, cancelled: cancelledRequests },
    donations: { total: totalMatches, completed: completedMatches },
    alerts: { total: totalAlerts, unresolved: unresolvedAlerts },
    payments: {
      total: totalPayments,
      completed: completedPayments._count,
      totalRevenue: completedPayments._sum.amount ?? 0,
    },
    recent: { requests: recentRequests, matches: recentMatches },
  };
};

export const listAllUsers = async (query: {
  role?: string;
  isActive?: boolean;
  search?: string;
  page: number;
  limit: number;
}) => {
  const skip = (query.page - 1) * query.limit;

  const where: any = {
    deletedAt: null,
    ...(query.role && { role: query.role }),
    ...(query.isActive !== undefined && { isActive: query.isActive }),
    ...(query.search && {
      OR: [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, role: true, phone: true,
        isActive: true, createdAt: true, donorProfile: { select: { bloodType: true, isAvailable: true, totalDonations: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, meta: { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) } };
};

export const toggleUserStatus = async (targetId: string, adminId: string) => {
  const user = await prisma.user.findUnique({ where: { id: targetId, deletedAt: null } });
  if (!user) throw new AppError('User not found', 404);
  if (user.role === 'ADMIN') throw new AppError('Cannot deactivate another admin', 403);

  const updated = await prisma.user.update({
    where: { id: targetId },
    data: { isActive: !user.isActive },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  await logAudit({
    userId: adminId,
    action: updated.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
    entity: 'User',
    entityId: targetId,
  });

  return updated;
};

export const softDeleteUser = async (targetId: string, adminId: string) => {
  const user = await prisma.user.findUnique({ where: { id: targetId, deletedAt: null } });
  if (!user) throw new AppError('User not found', 404);
  if (user.role === 'ADMIN') throw new AppError('Cannot delete another admin', 403);
  if (targetId === adminId) throw new AppError('Cannot delete your own account', 403);

  await prisma.user.update({ where: { id: targetId }, data: { deletedAt: new Date(), isActive: false } });

  await logAudit({ userId: adminId, action: 'USER_DELETED', entity: 'User', entityId: targetId });
};
