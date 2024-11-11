import { z } from 'zod';
import { SexEnum } from '../../enums';

export const patientSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  sex: z.nativeEnum(SexEnum),
  dateOfBirth: z.string(),
  villageNumber: z.number().int().positive(),
  isPregnant: z.boolean(),
  lastEdited: z.bigint(),
});
