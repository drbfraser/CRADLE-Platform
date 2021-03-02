import { OrUndefined, Reading } from 'src/types';

import { getLatestReadingWithReferral } from 'src/shared/utils';

export const getLatestDateReferred = (
  readings: Array<Reading>
): OrUndefined<number> => {
  return getLatestReadingWithReferral(readings)?.dateReferred;
};
