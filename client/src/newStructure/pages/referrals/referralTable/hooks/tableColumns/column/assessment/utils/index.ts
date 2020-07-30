import { OrUndefined, Reading } from '@types';

import { getLatestReadingWithReferral } from '../../utils';

export const getLatestReferralAssessed = (
  readings: Array<Reading>
): OrUndefined<boolean> => {
  return getLatestReadingWithReferral(readings).followup !== null;
};
