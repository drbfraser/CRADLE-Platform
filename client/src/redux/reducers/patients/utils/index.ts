import { OrNull, Patient, Reading } from '@types';

export const getPatientsWithReferrals = (
  patients: OrNull<Array<Patient>>
): Array<Patient> => {
  return (
    patients?.filter((patient: Patient) => {
      if (patient.readings.length === 0) {
        return false;
      }

      return patient.readings.some((reading: Reading): boolean => {
        return reading.referral !== null;
      });
    }) ?? []
  );
};
