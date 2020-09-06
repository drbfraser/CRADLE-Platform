import { OrUndefined, Reading } from '@types';

import { getLatestReadingWithReferral } from '../../../../../../../../shared/utils';

export const getLatestDateReferred = (
  readings: Array<Reading>
): OrUndefined<number> => {
  return getLatestReadingWithReferral(readings)?.dateReferred;
};
