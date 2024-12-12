import { TrafficLightEnum } from 'src/shared/enums';
import { z } from 'zod';

export const readingSchema = z.object({
  id: z.string().uuid(),
  systolicBloodPressure: z.number(),
  diastolicBloodPressure: z.number(),
  symptoms: z.array(z.string()),
  trafficLightStatus: z.nativeEnum(TrafficLightEnum),
});
