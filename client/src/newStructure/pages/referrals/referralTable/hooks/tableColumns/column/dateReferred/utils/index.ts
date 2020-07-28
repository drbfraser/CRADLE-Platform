import { OrUndefined, Reading } from '@types';

import { getMomentDate } from '../../../../../../../../shared/utils';

export const getLatestReferral = (
  readings: Array<Reading>
): OrUndefined<number> => {
  const sortedReadings = readings.sort(
    (reading: Reading, otherReading: Reading): number => {
      return (
        getMomentDate(otherReading.dateTimeTaken).valueOf() -
        getMomentDate(reading.dateTimeTaken).valueOf()
      );
    }
  );

  return sortedReadings[0].dateReferred;
};
