import { z } from 'zod';

export const initiatePaymentSchema = z.object({
  requestId: z.string().min(1, 'requestId is required'),
  amount: z.number().positive('Amount must be positive').min(1, 'Minimum amount is 1'),
  currency: z.string().length(3, 'Currency must be a 3-letter ISO code').optional().default('usd'),
});
