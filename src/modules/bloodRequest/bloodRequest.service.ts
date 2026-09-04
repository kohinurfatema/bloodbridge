import prisma from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { createEmergencyAlert } from '../alert/alert.service';
import { logAudit } from '../../utils/auditLogger';

export const createBloodRequest = async (requesterId: string, data: {
  patientName: string;
  bloodType: string;
  urgency: string;
  hospital: string;
  location: string;
  note?: string;
}) => {
  const request = await prisma.bloodRequest.create({
    data: {
      requesterId,
      patientName: data.patientName,
      bloodType: data.bloodType as any,
      urgency: data.urgency as any,
      hospital: data.hospital,
      location: data.location,
      note: data.note,
    },
    include: { requester: { select: { id: true, name: true, email: true, phone: true } } },
  });

  if (data.urgency === 'EMERGENCY') {
    await createEmergencyAlert(request.id);
  }

  await logAudit({ userId: requesterId, action: 'BLOOD_REQUEST_CREATED', entity: 'BloodRequest', entityId: request.id, metadata: { bloodType: data.bloodType, urgency: data.urgency } });

  return request;
};

export const listBloodRequests = async (query: {
  bloodType?: string;
  urgency?: string;
  status?: string;
  location?: string;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}) => {
  const skip = (query.page - 1) * query.limit;

  const where: any = {
    deletedAt: null,
    ...(query.bloodType && { bloodType: query.bloodType }),
    ...(query.urgency && { urgency: query.urgency }),
    ...(query.status && { status: query.status }),
    ...(query.location && { location: { contains: query.location, mode: 'insensitive' } }),
  };

  const [requests, total] = await Promise.all([
    prisma.bloodRequest.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: { [query.sortBy]: query.sortOrder },
      include: { requester: { select: { id: true, name: true, phone: true } } },
    }),
    prisma.bloodRequest.count({ where }),
  ]);

  return {
    requests,
    meta: { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) },
  };
};

export const getMyBloodRequests = async (requesterId: string, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const where = { requesterId, deletedAt: null };

  const [requests, total] = await Promise.all([
    prisma.bloodRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { matches: { select: { id: true, status: true, donor: { select: { user: { select: { name: true, phone: true } } } } } } },
    }),
    prisma.bloodRequest.count({ where }),
  ]);

  return {
    requests,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const updateRequestStatus = async (id: string, userId: string, role: string, status: string) => {
  const request = await prisma.bloodRequest.findUnique({ where: { id, deletedAt: null } });
  if (!request) throw new AppError('Blood request not found', 404);

  if (role === 'REQUESTER') {
    if (request.requesterId !== userId) throw new AppError('You can only update your own requests', 403);
    if (status !== 'CANCELLED') throw new AppError('Requesters can only cancel their own requests', 403);
    if (request.status !== 'PENDING') throw new AppError('Only pending requests can be cancelled', 400);
  }

  if (role === 'DONOR') throw new AppError('Donors cannot update request status', 403);

  const updated = await prisma.bloodRequest.update({
    where: { id },
    data: { status: status as any },
    include: { requester: { select: { id: true, name: true, email: true } } },
  });
  return updated;
};

export const softDeleteRequest = async (id: string, userId: string, role: string) => {
  const request = await prisma.bloodRequest.findUnique({ where: { id, deletedAt: null } });
  if (!request) throw new AppError('Blood request not found', 404);

  if (role === 'REQUESTER' && request.requesterId !== userId) {
    throw new AppError('You can only delete your own requests', 403);
  }
  if (role === 'DONOR') throw new AppError('Donors cannot delete requests', 403);

  await prisma.bloodRequest.update({ where: { id }, data: { deletedAt: new Date() } });
};

export const getBloodRequestById = async (id: string) => {
  const request = await prisma.bloodRequest.findUnique({
    where: { id, deletedAt: null },
    include: {
      requester: { select: { id: true, name: true, email: true, phone: true } },
      matches: {
        select: {
          id: true, status: true, createdAt: true,
          donor: { select: { user: { select: { name: true, phone: true } } } },
        },
      },
    },
  });
  if (!request) throw new AppError('Blood request not found', 404);
  return request;
};
