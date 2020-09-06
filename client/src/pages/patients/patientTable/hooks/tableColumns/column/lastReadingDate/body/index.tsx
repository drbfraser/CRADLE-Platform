import { OrNull, Reading } from '@types';
import {
  getLatestReadingDateTime,
  getPrettyDate,
} from '../../../../../../../../shared/utils';

import React from 'react';

interface IProps {
  className: string;
  readings: Array<Reading>;
}

export const LastReadingDateBody: React.FC<IProps> = ({
  className,
  readings,
}) => {
  const latestReadingDateTime = React.useMemo((): OrNull<number> => {
    return getLatestReadingDateTime(readings);
  }, [readings]);

  return latestReadingDateTime ? (
    <p className={className}>{getPrettyDate(latestReadingDateTime)}</p>
  ) : null;
};
