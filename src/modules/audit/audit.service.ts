import prisma from '../../config/prisma';
import { AppError } from '../../utils/AppError';

export const getAuditLogs = async (query: {
  userId?: string;
  action?: string;
  entity?: string;
  page: number;
  limit: number;
}) => {
  const skip = (query.page - 1) * query.limit;

  const where: any = {
    ...(query.userId && { userId: query.userId }),
    ...(query.action && { action: { contains: query.action, mode: 'insensitive' } }),
    ...(query.entity && { entity: query.entity }),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, meta: { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) } };
};

export const getAuditLogById = async (id: string) => {
  const log = await prisma.auditLog.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  });
  if (!log) throw new AppError('Audit log not found', 404);
  return log;
};
