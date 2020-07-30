import { OrUndefined, Reading } from '@types';

import React from 'react';
import { getLatestDateReferred } from '../utils';
import { getPrettyDate } from '../../../../../../../../shared/utils';

interface IProps {
  className: string;
  readings: Array<Reading>;
}

export const DateReferredBody: React.FC<IProps> = ({ className, readings }) => {
  const latestDateReferred = React.useMemo((): OrUndefined<number> => {
    return getLatestDateReferred(readings);
  }, [readings]);

  return (
    <p className={className}>
      {latestDateReferred ? getPrettyDate(latestDateReferred) : `N/A`}
    </p>
  );
};
