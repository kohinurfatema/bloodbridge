import prisma from '../../config/prisma';
import { AppError } from '../../utils/AppError';

export const searchDonors = async (query: {
  bloodType?: string;
  location?: string;
  isAvailable?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const skip = (page - 1) * limit;

  const where: any = {
    user: { deletedAt: null, isActive: true },
    ...(query.bloodType && { bloodType: query.bloodType }),
    ...(query.location && { location: { contains: query.location, mode: 'insensitive' } }),
    ...(query.isAvailable !== undefined && { isAvailable: query.isAvailable }),
  };

  const allowedSortFields = ['createdAt', 'totalDonations', 'lastDonationDate'];
  const sortBy = allowedSortFields.includes(query.sortBy ?? '') ? query.sortBy! : 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

  const [donors, total] = await Promise.all([
    prisma.donorProfile.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        user: { select: { id: true, name: true, phone: true } },
      },
    }),
    prisma.donorProfile.count({ where }),
  ]);

  return {
    donors,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const registerDonor = async (userId: string, data: {
  bloodType: string;
  location: string;
  lastDonationDate?: string;
  isAvailable?: boolean;
}) => {
  const user = await prisma.user.findUnique({ where: { id: userId, deletedAt: null } });
  if (!user) throw new AppError('User not found', 404);
  if (user.role !== 'DONOR') throw new AppError('Only users with DONOR role can register as donors', 403);

  const existing = await prisma.donorProfile.findUnique({ where: { userId } });
  if (existing) throw new AppError('Donor profile already exists', 409);

  const profile = await prisma.donorProfile.create({
    data: {
      userId,
      bloodType: data.bloodType as any,
      location: data.location,
      lastDonationDate: data.lastDonationDate ? new Date(data.lastDonationDate) : undefined,
      isAvailable: data.isAvailable ?? true,
    },
  });
  return profile;
};

export const getMyDonorProfile = async (userId: string) => {
  const profile = await prisma.donorProfile.findUnique({
    where: { userId },
    include: { user: { select: { id: true, name: true, email: true, phone: true } } },
  });
  if (!profile) throw new AppError('Donor profile not found', 404);
  return profile;
};

export const updateMyDonorProfile = async (userId: string, data: {
  bloodType?: string;
  location?: string;
  lastDonationDate?: string;
  isAvailable?: boolean;
}) => {
  const profile = await prisma.donorProfile.findUnique({ where: { userId } });
  if (!profile) throw new AppError('Donor profile not found. Please register as a donor first.', 404);

  const updated = await prisma.donorProfile.update({
    where: { userId },
    data: {
      ...(data.bloodType && { bloodType: data.bloodType as any }),
      ...(data.location && { location: data.location }),
      ...(data.lastDonationDate && { lastDonationDate: new Date(data.lastDonationDate) }),
      ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
    },
  });
  return updated;
};
