import { z } from 'zod';
import { lowerCase } from 'lodash';
import { UserRoleEnum } from 'src/shared/enums';

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

const userSchema = z.object({
  id: z.number().int().positive(),
  username: z.string(),
  email: z.string().email({ message: 'Invalid email address.' }),
  healthFacilityName: z.string(),
  role: z.nativeEnum(UserRoleEnum),
  smsKey: z.string().nullable(),
  supervises: z.array(z.number().int().positive()).optional(),
  phoneNumbers: z.array(z.string()),
});

// Schema for validating the response body of authentication request.
export const authResponseSchema = z.object({
  accessToken: z.string(),
  challenge: authChallengeSchema.nullable(),
  user: userSchema,
});

export type AuthResponse = z.infer<typeof authResponseSchema>;
export type AuthChallenge = z.infer<typeof authChallengeSchema>;
export type UserSchema = z.infer<typeof userSchema>;
