import { z } from 'zod';

const bloodTypes = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'] as const;
const urgencies = ['NORMAL', 'URGENT', 'EMERGENCY'] as const;

export const createRequestSchema = z.object({
  bloodType: z.enum(bloodTypes, { error: 'Invalid blood type' }),
  urgency: z.enum(urgencies).optional().default('NORMAL'),
  units: z.number().int().positive().optional().default(1),
  hospital: z.string().min(2, 'Hospital name is required').optional(),
  location: z.string().min(2, 'Location is required'),
  notes: z.string().optional(),
  requiredDate: z.string().datetime({ offset: true }),
});

export const listRequestsQuerySchema = z.object({
  bloodType: z.enum(bloodTypes).optional(),
  urgency: z.enum(urgencies).optional(),
  status: z.enum(['PENDING', 'MATCHED', 'FULFILLED', 'CANCELLED']).optional(),
  location: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
  sortBy: z.enum(['createdAt', 'urgency', 'requiredDate']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
