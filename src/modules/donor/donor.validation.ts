import { z } from 'zod';

const bloodTypes = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'] as const;

export const registerDonorSchema = z.object({
  bloodType: z.enum(bloodTypes, { error: 'Invalid blood type' }),
  location: z.string().min(2, 'Location is required'),
  lastDonationDate: z.string().datetime({ offset: true }).optional(),
  isAvailable: z.boolean().optional().default(true),
});

export const updateDonorSchema = z.object({
  bloodType: z.enum(bloodTypes).optional(),
  location: z.string().min(2).optional(),
  lastDonationDate: z.string().datetime({ offset: true }).optional(),
  isAvailable: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'At least one field is required' });
