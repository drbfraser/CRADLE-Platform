import { z, ZodError } from 'zod';

export const colorReadingSchema = z.object({
  GREEN: z.number(),
  YELLOW_UP: z.number(),
  YELLOW_DOWN: z.number(),
  RED_UP: z.number(),
  RED_DOWN: z.number(),
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

export const validateStatsData = async (data: unknown): Promise<StatsData> => {
  try {
    return await statsDataSchema.parseAsync(data);
  } catch (e) {
    if (e instanceof ZodError) {
      console.error(`Error validating statisitcs data: ${e}`);
    }
    throw e;
  }
};
