import { Reading } from 'src/types';
import { getMomentDate } from 'src/shared/utils';

export const sortReadings = (readings: Array<Reading>) => {
  return readings.sort(
    (reading, otherReading) =>
      getMomentDate(otherReading.dateTimeTaken).valueOf() -
      getMomentDate(reading.dateTimeTaken).valueOf()
  );
};
