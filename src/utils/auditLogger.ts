import prisma from '../config/prisma';

export const logAudit = async (params: {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) => {
  try {
    await prisma.auditLog.create({ data: params });
  } catch {
    // audit failures must never crash the main request
  }
};
