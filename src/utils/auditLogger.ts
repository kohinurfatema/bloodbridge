import prisma from '../config/prisma';

export const logAudit = async (params: {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId,
        details: params.details,
      },
    });
  } catch {
    // audit failures must never crash the main request
  }
};
