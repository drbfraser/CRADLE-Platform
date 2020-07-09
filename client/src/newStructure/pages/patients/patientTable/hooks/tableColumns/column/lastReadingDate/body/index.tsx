import {
  getLatestReadingDateTime,
  getPrettyDate,
} from '../../../../../../../../shared/utils';

import React from 'react';
import { Reading } from '@types';

interface IProps {
  className: string;
  readings: Array<Reading>;
}

export const LastReadingDateBody: React.FC<IProps> = ({
  className,
  readings,
}) => {
  return (
    <p className={className}>
      {getPrettyDate(getLatestReadingDateTime(readings))}
    </p>
  );
};
