import { CurrentMonthContext } from '..';
import React from 'react';

export const useCurrentMonthContext = (): number => {
  return React.useContext(CurrentMonthContext);
};
