import { z } from 'zod';
import { lowerCase } from 'lodash';
import { userSchema } from './user';

export const authRequestSchema = z.object({
  // Username should be case-insensitive.
  username: z.string().transform((value) => lowerCase(value)),
  password: z.string(),
});

const authChallengeSchema = z.object({
  challengeName: z
    .union([
      z.literal('SMS_MFA'),
      z.literal('EMAIL_OTP'),
      z.literal('SOFTWARE_TOKEN_MFA'),
      z.literal('SELECT_MFA_TYPE'),
      z.literal('MFA_SETUP'),
      z.literal('PASSWORD_VERIFIER'),
      z.literal('CUSTOM_CHALLENGE'),
      z.literal('DEVICE_SRP_AUTH'),
      z.literal('DEVICE_PASSWORD_VERIFIER'),
      z.literal('ADMIN_NO_SRP_AUTH'),
      z.literal('NEW_PASSWORD_REQUIRED'),
    ])
    .nullable(),
  challengeParams: z.record(z.string()),
  session: z.string().nullable(),
});

// Schema for validating the response body of authentication request.
export const authResponseSchema = z.object({
  accessToken: z.string(),
  challenge: authChallengeSchema.nullable(),
  user: userSchema,
});

export type AuthResponse = z.infer<typeof authResponseSchema>;
export type AuthChallenge = z.infer<typeof authChallengeSchema>;
