import { Reading } from '@types';
import { getMomentDate } from '../../../../../../../shared/utils';

export const getLatestReadingWithReferral = (
  readings: Array<Reading>
): Reading => {
  // * Sort readings in ascending order of date reading was taken
  // * Therefore, first reading is the last one to be taken
  return readings
    .filter((reading: Reading): boolean => Boolean(reading.referral))
    .sort((reading: Reading, otherReading: Reading): number => {
      return (
        getMomentDate(otherReading.dateTimeTaken).valueOf() -
        getMomentDate(reading.dateTimeTaken).valueOf()
      );
    })[0];
};
