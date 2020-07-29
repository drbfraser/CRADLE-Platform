import { Reading } from '@types';
import { getMomentDate } from '../../../../../../shared/utils';

export const sortReadings = (readings: Array<Reading>) => {
  return readings.sort(
    (reading, otherReading) =>
      getMomentDate(otherReading.dateTimeTaken).valueOf() -
      getMomentDate(reading.dateTimeTaken).valueOf()
  );
};
