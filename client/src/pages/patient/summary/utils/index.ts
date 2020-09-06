import { OrNull, Patient, Reading } from '@types';
import { getLatestReading, getMomentDate } from '../../../../shared/utils';

export const average = (monthlyArray: Array<number>): number => {
  return (
    monthlyArray.reduce((total: number, value: number): number => {
      return total + value;
    }, 0) / monthlyArray.length
  );
};

export const getLatestReadingDateTime = (
  readings: Array<Reading>
): OrNull<number> => {
  return getLatestReading(readings).dateTimeTaken;
};

export const sortPatientsByLastReading = (
  patient: Patient,
  otherPatient: Patient
): number => {
  return (
    getMomentDate(getLatestReadingDateTime(otherPatient.readings)).valueOf() -
    getMomentDate(getLatestReadingDateTime(patient.readings)).valueOf()
  );
};
