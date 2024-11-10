import { z } from 'zod';

export const smsKeySchema = z.object({
  key: z.string(),
  message: z.string(),
  expiryDate: z.coerce.date(),
  staleDate: z.coerce.date(),
});
