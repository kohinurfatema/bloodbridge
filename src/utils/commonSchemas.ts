import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

export const uuidSchema = z.string().uuid('Invalid ID format');

export const bloodTypeEnum = z.enum(
  ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'],
  { error: 'Invalid blood type. Use A_POS, A_NEG, B_POS, B_NEG, AB_POS, AB_NEG, O_POS, or O_NEG' }
);

export const urgencyEnum = z.enum(['NORMAL', 'URGENT', 'EMERGENCY']);
export const roleEnum = z.enum(['DONOR', 'REQUESTER', 'ADMIN']);
export const requestStatusEnum = z.enum(['PENDING', 'MATCHED', 'FULFILLED', 'CANCELLED']);
export const matchStatusEnum = z.enum(['PENDING', 'ACCEPTED', 'DECLINED', 'COMPLETED']);
