import { OrNull, Patient, Reading } from '@types';

import { getMomentDate } from '../../../../shared/utils';

export const average = (monthlyArray: Array<number>): number => {
  return (
    monthlyArray.reduce((total: number, value: number): number => {
      return total + value;
    }, 0) / monthlyArray.length
  );
};

export const getReferralIds = (patient: OrNull<Patient>): Array<string> => {
  return (
    patient?.readings?.reduce(
      (referralIds: Array<string>, { referral }: Reading): Array<string> => {
        return referral === null ? referralIds : [...referralIds, referral];
      },
      []
    ) ?? []
  );
};

export const getLatestReading = (readings: Array<Reading>): Reading => {
  const sortedReadings = readings.sort(
    (a, b) =>
      getMomentDate(b.dateTimeTaken).valueOf() -
      getMomentDate(a.dateTimeTaken).valueOf()
  );
  return sortedReadings[0];
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
