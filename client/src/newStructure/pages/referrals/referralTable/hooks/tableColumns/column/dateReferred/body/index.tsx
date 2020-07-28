import { OrUndefined, Reading } from '@types';

import React from 'react';
import { getLatestReferral } from '../utils';
import { getPrettyDate } from '../../../../../../../../shared/utils';

interface IProps {
  className: string;
  readings: Array<Reading>;
}

export const DateReferredBody: React.FC<IProps> = ({ className, readings }) => {
  const latestReferral = React.useMemo((): OrUndefined<number> => {
    return getLatestReferral(readings);
  }, [readings]);

  return latestReferral ? (
    <p className={className}>{getPrettyDate(latestReferral)}</p>
  ) : null;
};
