import { z } from 'zod';
import { SexEnum, TrafficLightEnum } from '../../enums';

// Schema for Patient model.
export const patientSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  sex: z.nativeEnum(SexEnum),
  dateOfBirth: z.string(),
  villageNumber: z.number().int(),
  isPregnant: z.boolean(),
  lastEdited: z.bigint(),
});

/** The API Endpoint called by the table on the patients page returns a subset
 *  of the data stored in the patient table of the database joined with a subset
 *  of reading data.
 * */
export const patientListItemSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  villageNumber: z.number().int(),
  trafficLightStatus: z.nativeEnum(TrafficLightEnum),
});
