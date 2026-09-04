import prisma from '../../config/prisma';
import { AppError } from '../../utils/AppError';

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
