import prisma from '../../config/prisma';
import { AppError } from '../../utils/AppError';

export const createEmergencyAlert = async (requestId: string) => {
  const request = await prisma.bloodRequest.findUnique({
    where: { id: requestId, deletedAt: null },
    include: { requester: { select: { name: true } } },
  });
  if (!request) throw new AppError('Blood request not found', 404);

  const existing = await prisma.emergencyAlert.findUnique({ where: { requestId } });
  if (existing) throw new AppError('Alert already exists for this request', 409);

  const alert = await prisma.emergencyAlert.create({
    data: { requestId },
    include: {
      request: {
        select: { id: true, bloodType: true, hospital: true, location: true, urgency: true },
      },
    },
  });
  return alert;
};

export const listAlerts = async (page = 1, limit = 10, onlyActive = false) => {
  const skip = (page - 1) * limit;
  const where = onlyActive ? { isResolved: false } : {};

  const [alerts, total] = await Promise.all([
    prisma.emergencyAlert.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        request: {
          select: { id: true, bloodType: true, hospital: true, location: true, urgency: true, status: true },
        },
      },
    }),
    prisma.emergencyAlert.count({ where }),
  ]);

  return { alerts, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

export const resolveAlert = async (alertId: string) => {
  const alert = await prisma.emergencyAlert.findUnique({ where: { id: alertId } });
  if (!alert) throw new AppError('Alert not found', 404);
  if (alert.isResolved) throw new AppError('Alert is already resolved', 400);

  const updated = await prisma.emergencyAlert.update({
    where: { id: alertId },
    data: { isResolved: true },
  });
  return updated;
};
