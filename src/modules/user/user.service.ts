import prisma from '../../config/prisma';
import { AppError } from '../../utils/AppError';

export const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId, deletedAt: null },
    select: {
      id: true, name: true, email: true, role: true, phone: true,
      isActive: true, createdAt: true, updatedAt: true,
      donorProfile: true,
    },
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const updateMyProfile = async (userId: string, data: { name?: string; phone?: string }) => {
  const user = await prisma.user.findUnique({ where: { id: userId, deletedAt: null } });
  if (!user) throw new AppError('User not found', 404);

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true, name: true, email: true, role: true, phone: true,
      isActive: true, updatedAt: true,
    },
  });
  return updated;
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id, deletedAt: null },
    select: {
      id: true, name: true, email: true, role: true, phone: true,
      isActive: true, createdAt: true, donorProfile: true,
    },
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
};
