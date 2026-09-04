import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma';
import { AppError } from '../../utils/AppError';

const JWT_SECRET = process.env.JWT_SECRET ?? 'secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'refresh_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';

export const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
  const refreshToken = jwt.sign({ id: userId, role }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);
  return { accessToken, refreshToken };
};

export const registerUser = async (name: string, email: string, password: string, role: string, phone?: string) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('Email already registered', 409);

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: role as any, phone },
    select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true },
  });

  const tokens = generateTokens(user.id, user.role);
  return { user, ...tokens };
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email, deletedAt: null } });
  if (!user || !user.password) throw new AppError('Invalid email or password', 401);
  if (!user.isActive) throw new AppError('Account is deactivated', 403);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError('Invalid email or password', 401);

  const tokens = generateTokens(user.id, user.role);
  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    ...tokens,
  };
};

export const refreshAccessToken = (token: string) => {
  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET) as { id: string; role: string };
    const accessToken = jwt.sign({ id: payload.id, role: payload.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
    return { accessToken };
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }
};
