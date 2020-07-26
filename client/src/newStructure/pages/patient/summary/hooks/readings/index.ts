import { Patient, Reading } from '@types';
import { createReadingObject, sortReadings } from './utils';

import React from 'react';

export const useReadings = (patient: Patient): Array<Reading> => {
  return React.useMemo((): Array<Reading> => {
    return sortReadings(patient.readings.map(createReadingObject));
  }, [patient]);
};
