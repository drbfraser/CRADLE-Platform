import React from 'react';
import { Reading } from '@types';
import { getLatestReferral } from '../utils';
import { getPrettyDate } from '../../../../../../../../shared/utils';

interface IProps {
  className: string;
  readings: Array<Reading>;
}

export const DateReferredBody: React.FC<IProps> = ({ className, readings }) => {
  return (
    <p className={className}>{getPrettyDate(getLatestReferral(readings))}</p>
  );
};
