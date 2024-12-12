import { z } from 'zod';

export const colorReadingSchema = z.object({
  green: z.number(),
  yellowUp: z.number(),
  yellowDown: z.number(),
  redUp: z.number(),
  redDown: z.number(),
});

export type ColorReading = z.infer<typeof colorReadingSchema>;

export const statsDataSchema = z.object({
  uniquePatientReadings: z.number().int(),
  daysWithReadings: z.number().int(),
  sentReferrals: z.number().int(),
  patientsReferred: z.number().int().optional(),
  totalReadings: z.number().int(),
  colorReadings: colorReadingSchema,
});

export type StatsData = z.infer<typeof statsDataSchema>;
