import prisma from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { logAudit } from '../../utils/auditLogger';

export const createMatch = async (requestId: string, donorId: string, adminId: string) => {
  const request = await prisma.bloodRequest.findUnique({ where: { id: requestId, deletedAt: null } });
  if (!request) throw new AppError('Blood request not found', 404);
  if (request.status === 'CANCELLED') throw new AppError('Cannot match a cancelled request', 400);
  if (request.status === 'FULFILLED') throw new AppError('Request is already fulfilled', 400);

  const donor = await prisma.donorProfile.findUnique({ where: { id: donorId } });
  if (!donor) throw new AppError('Donor profile not found', 404);
  if (!donor.isAvailable) throw new AppError('Donor is not available', 400);

  const bloodTypeCompatible = donor.bloodType === request.bloodType;
  if (!bloodTypeCompatible) throw new AppError('Donor blood type does not match request blood type', 400);

  const existingMatch = await prisma.donationMatch.findFirst({
    where: { requestId, donorId, status: { in: ['PENDING', 'ACCEPTED'] } },
  });
  if (existingMatch) throw new AppError('An active match already exists for this donor and request', 409);

  const [match] = await prisma.$transaction([
    prisma.donationMatch.create({
      data: { requestId, donorId },
      include: {
        request: { select: { id: true, patientName: true, bloodType: true, hospital: true, urgency: true } },
        donor: { select: { user: { select: { id: true, name: true, phone: true } } } },
      },
    }),
    prisma.bloodRequest.update({ where: { id: requestId }, data: { status: 'MATCHED' } }),
  ]);

  await logAudit({ userId: adminId, action: 'MATCH_CREATED', entity: 'DonationMatch', entityId: match.id, metadata: { requestId, donorId } });
  return match;
};

export const getMatchesForRequest = async (requestId: string, userId: string, role: string) => {
  const request = await prisma.bloodRequest.findUnique({ where: { id: requestId, deletedAt: null } });
  if (!request) throw new AppError('Blood request not found', 404);

  if (role === 'REQUESTER' && request.requesterId !== userId) {
    throw new AppError('You can only view matches for your own requests', 403);
  }

  const matches = await prisma.donationMatch.findMany({
    where: { requestId },
    include: {
      donor: { select: { id: true, bloodType: true, location: true, user: { select: { name: true, phone: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return matches;
};

export const respondToMatch = async (matchId: string, userId: string, response: 'ACCEPTED' | 'DECLINED' | 'COMPLETED') => {
  const donor = await prisma.donorProfile.findUnique({ where: { userId } });
  if (!donor) throw new AppError('Donor profile not found', 404);

  const match = await prisma.donationMatch.findUnique({
    where: { id: matchId },
    include: { request: true },
  });
  if (!match) throw new AppError('Match not found', 404);
  if (match.donorId !== donor.id) throw new AppError('You can only respond to your own matches', 403);
  if (match.status === 'DECLINED' || match.status === 'COMPLETED') {
    throw new AppError(`Match is already ${match.status.toLowerCase()}`, 400);
  }

  if (response === 'ACCEPTED') {
    const [updated] = await prisma.$transaction([
      prisma.donationMatch.update({ where: { id: matchId }, data: { status: 'ACCEPTED' } }),
      prisma.donorProfile.update({ where: { id: donor.id }, data: { isAvailable: false } }),
    ]);
    return updated;
  }

  if (response === 'COMPLETED') {
    if (match.status !== 'ACCEPTED') throw new AppError('Only accepted matches can be marked as completed', 400);
    const [updated] = await prisma.$transaction([
      prisma.donationMatch.update({ where: { id: matchId }, data: { status: 'COMPLETED' } }),
      prisma.donorProfile.update({
        where: { id: donor.id },
        data: { isAvailable: true, totalDonations: { increment: 1 }, lastDonationDate: new Date() },
      }),
      prisma.bloodRequest.update({ where: { id: match.requestId }, data: { status: 'FULFILLED' } }),
    ]);
    return updated;
  }

  // DECLINED
  const updated = await prisma.donationMatch.update({ where: { id: matchId }, data: { status: 'DECLINED' } });

  const activeMatches = await prisma.donationMatch.count({
    where: { requestId: match.requestId, status: { in: ['PENDING', 'ACCEPTED'] } },
  });
  if (activeMatches === 0) {
    await prisma.bloodRequest.update({ where: { id: match.requestId }, data: { status: 'PENDING' } });
  }

  return updated;
};

export const getMyMatches = async (userId: string, page = 1, limit = 10) => {
  const donor = await prisma.donorProfile.findUnique({ where: { userId } });
  if (!donor) throw new AppError('Donor profile not found', 404);

  const skip = (page - 1) * limit;
  const where = { donorId: donor.id };

  const [matches, total] = await Promise.all([
    prisma.donationMatch.findMany({
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
    prisma.donationMatch.count({ where }),
  ]);

  return { matches, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};
