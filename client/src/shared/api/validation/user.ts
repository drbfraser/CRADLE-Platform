import { z } from 'zod';
import { UserRoleEnum } from 'src/shared/enums';
import { smsKeySchema } from './smsKey';

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
 *  These omitted properties are generated automatically on the server.
 */
export const newUserSchema = userSchema.omit({
  id: true,
  smsKey: true,
});
export type NewUser = z.infer<typeof newUserSchema>;

/** Schema of object to send to endpoint for editing/updating an existing user.
 *  Some fields like `username` cannot be changed and so are omitted here.
 */
export const editUserSchema = userSchema.omit({
  username: true,
  smsKey: true,
});
export type EditUser = z.infer<typeof editUserSchema>;
