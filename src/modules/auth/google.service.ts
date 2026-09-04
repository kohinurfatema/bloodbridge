import { OAuth2Client } from 'google-auth-library';
import prisma from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { generateTokens } from './auth.service';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (idToken: string) => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) throw new AppError('Invalid Google token', 401);

  const { email, name, sub: googleId } = payload;

  let user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    if (user.deletedAt) throw new AppError('Account has been deactivated', 403);
    if (!user.googleId) {
      user = await prisma.user.update({ where: { email }, data: { googleId } });
    }
  } else {
    user = await prisma.user.create({
      data: {
        name: name ?? email.split('@')[0],
        email,
        googleId,
        role: 'REQUESTER',
        isActive: true,
      },
    });
  }

  const tokens = generateTokens(user.id, user.role);
  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    ...tokens,
  };
};
