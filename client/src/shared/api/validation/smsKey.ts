import { z } from 'zod';

export const smsKeySchema = z.object({
  smsKey: z.string(),
  message: z.string(),
  expiryDate: z.date(),
  staleDate: z.date(),
});
