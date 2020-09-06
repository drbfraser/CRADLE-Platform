import { OrUndefined, Reading } from '@types';

import { getLatestReadingWithReferral } from '../../../../../../../../shared/utils';

export const getLatestReferralAssessed = (
  readings: Array<Reading>
): OrUndefined<boolean> => {
  return getLatestReadingWithReferral(readings)?.followup !== null;
};
