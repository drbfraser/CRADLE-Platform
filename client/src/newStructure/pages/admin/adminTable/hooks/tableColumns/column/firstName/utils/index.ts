import { OrUndefined, Reading } from '@types';

import { getLatestReadingWithReferral } from '../../utils';

export const getLatestDateReferred = (
  readings: Array<Reading>
): OrUndefined<number> => {
  return getLatestReadingWithReferral(readings).dateReferred;
};
