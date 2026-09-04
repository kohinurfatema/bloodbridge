import prisma from '../../config/prisma';
import { AppError } from '../../utils/AppError';

export const createEmergencyAlert = async (requestId: string, message?: string) => {
  const request = await prisma.bloodRequest.findUnique({
    where: { id: requestId, deletedAt: null },
    include: { requester: { select: { name: true } } },
  });
  if (!request) throw new AppError('Blood request not found', 404);

  const defaultMessage = `EMERGENCY: ${request.bloodType.replace('_', '+')} blood urgently needed at ${request.hospital} for patient ${request.patientName}. Contact requester immediately.`;

  const alert = await prisma.emergencyAlert.create({
    data: {
      requestId,
      message: message ?? defaultMessage,
    },
    include: {
      request: {
        select: { id: true, patientName: true, bloodType: true, hospital: true, location: true, urgency: true },
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
          select: { id: true, patientName: true, bloodType: true, hospital: true, location: true, urgency: true, status: true },
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
