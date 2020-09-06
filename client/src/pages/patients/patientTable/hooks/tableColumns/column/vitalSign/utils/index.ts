import { Reading } from '@types';
import { calculateShockIndex } from '../../../../../../../../shared/utils';

export const getFirstReadingWithTrafficLight = (
  readings: Array<Reading>
): Reading => {
  const readingWithTrafficLight = readings.find((reading: Reading): boolean =>
    Boolean(reading.trafficLightStatus)
  );

  if (!readingWithTrafficLight) {
    return {
      ...readings[0],
      trafficLightStatus: calculateShockIndex(readings[0]),
    };
  }

  return readingWithTrafficLight;
};
