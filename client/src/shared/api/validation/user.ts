import { z } from 'zod';
import { UserRoleEnum } from 'src/shared/enums';
import { smsKeySchema } from './smsKey';

/**
 * Oct 24, 2024 - It seems that for the last 2 years, there has been a pretty
 * major bug with this User model definition. The "phoneNumber" attribute was
 * not aligned with the "phoneNumbers" attribute of the objects returned from
 * the server. Apparently the front-end was completely unaware of this
 * one-to-many relationship where users can have multiple phone numbers.
 * Consequently there are various things in the client-side code which expect
 * a "phoneNumber" attribute, so I have add the "phoneNumbers" array while
 * keeping the "phoneNumber" attribute.
 */

export const userSchema = z.object({
  id: z.number().int(),
  username: z.string(),
  name: z.string(),
  email: z.string().email({ message: 'Invalid email address.' }),
  healthFacilityName: z.string(),
  role: z.nativeEnum(UserRoleEnum),
  smsKey: smsKeySchema.nullable(),
  supervises: z.array(z.number().int()).default([]),
  phoneNumbers: z.array(z.string()),
  phoneNumber: z.string().optional(),
});
export type User = z.infer<typeof userSchema>;

/** Schema of object to send to endpoint for creating a new user.
 *  These properties are generated automatically on the server.
 */
export const newUserSchema = userSchema.omit({
  id: true,
  smsKey: true,
});
export type NewUser = z.infer<typeof newUserSchema>;

/** Schema of object to send to endpoint for editing/updating an existing user.
 *  Some fields like `username` cannot be changed and so are excluded here.
 */
export const editUserSchema = userSchema.omit({
  username: true,
  smsKey: true,
});
export type EditUser = z.infer<typeof editUserSchema>;
