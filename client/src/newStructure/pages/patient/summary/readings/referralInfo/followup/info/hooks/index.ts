import { FollowUp, OrNull } from '@types';

import React from 'react';
import { followupFrequencyUnit } from './utils';

interface IArgs {
  followUp: OrNull<FollowUp>;
}

export const useFrequency = ({ followUp }: IArgs): string => {
  return React.useMemo((): string => {
    if (
      followUp?.followupFrequencyValue !== null &&
      followUp?.followupFrequencyUnit &&
      followUp?.followupFrequencyUnit !== followupFrequencyUnit[0] &&
      followUp?.dateFollowupNeededTill !== null
    ) {
      return `Every ${
        followUp?.followupFrequencyValue
      } ${followUp?.followupFrequencyUnit.value.toLowerCase()} until ${
        followUp?.dateFollowupNeededTill
      }`;
    }

    return `N/A`;
  }, [followUp]);
};
