import { z } from 'zod';
import { lowerCase } from 'lodash';
import { UserRoleEnum } from 'src/shared/enums';

const roleEnumOptions = UserRoleEnum;

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
);

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
  challengeParams: z.map(z.string(), z.string()),
  session: z.string().nullable(),
});

// Schema for validating the response body of authentication request.
export const authResponseSchema = z.object({
  accessToken: z.string(),
  challenge: authChallengeSchema.nullable(),
  user: z.object({
    id: z.number().int().positive(),
    username: z.string(),
    email: z.string().email({ message: 'Invalid email address.' }),
    healthFacilityName: z.string(),
    role: z.nativeEnum(UserRoleEnum),
    smsKey: z.string().nullable(),
  }),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;
export type AuthChallenge = z.infer<typeof authChallengeSchema>;
