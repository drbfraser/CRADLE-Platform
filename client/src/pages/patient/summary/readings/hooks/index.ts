import { Patient, Reading } from '@types';

import React from 'react';
import { sortReadings } from './utils';

export const useReadings = (patient: Patient): Array<Reading> => {
  return React.useMemo((): Array<Reading> => {
    return sortReadings(patient.readings);
  }, [patient.readings]);
};
