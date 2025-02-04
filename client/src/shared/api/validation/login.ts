import { z } from 'zod';
import { lowerCase } from 'lodash';
import { userSchema } from './user';

export const authRequestSchema = z.object({
  // Username should be case-insensitive.
  username: z.string().transform((value) => lowerCase(value)),
  password: z.string(),
});

// Schema for validating the response body of authentication request.
export const authResponseSchema = z.object({
  accessToken: z.string(),
  user: userSchema,
});

export type AuthResponse = z.infer<typeof authResponseSchema>;
