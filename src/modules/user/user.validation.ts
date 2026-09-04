import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().min(7, 'Invalid phone number').optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'At least one field is required' });
