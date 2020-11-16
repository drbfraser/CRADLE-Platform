export const GESTATIONAL_AGE_UNITS = {
  WEEKS: 'GESTATIONAL_AGE_UNITS_WEEKS',
  MONTHS: 'GESTATIONAL_AGE_UNITS_MONTHS',
};

export const SEXES = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
};

export enum PatientField {
  patientId = 'patientId',
  patientName = 'patientName',
  householdNumber = 'householdNumber',
  isExactDob = 'isExactDob',
  dob = 'dob',
  estimatedAge = 'estimatedAge',
  zone = 'zone',
  villageNumber = 'villageNumber',
  patientSex = 'patientSex',
  isPregnant = 'isPregnant',
  gestationalAge = 'gestationalAge',
  gestationalAgeUnit = 'gestationalAgeUnit',
  drugHistory = 'drugHistory',
  medicalHistory = 'medicalHistory',
}

export const initialState = {
  [PatientField.patientId]: '',
  [PatientField.patientName]: '',
  [PatientField.householdNumber]: '',
  [PatientField.isExactDob]: true,
  [PatientField.dob]: '',
  [PatientField.estimatedAge]: '',
  [PatientField.zone]: '',
  [PatientField.villageNumber]: '',
  [PatientField.patientSex]: SEXES.MALE,
  [PatientField.isPregnant]: false,
  [PatientField.gestationalAge]: '',
  [PatientField.gestationalAgeUnit]: GESTATIONAL_AGE_UNITS.WEEKS,
  [PatientField.drugHistory]: '',
  [PatientField.medicalHistory]: '',
  error: {
    [PatientField.patientId]: false,
    [PatientField.patientName]: false,
    [PatientField.householdNumber]: false,
    [PatientField.isExactDob]: false,
    [PatientField.dob]: false,
    [PatientField.estimatedAge]: false,
    [PatientField.zone]: false,
    [PatientField.villageNumber]: false,
    [PatientField.patientSex]: false,
    [PatientField.isPregnant]: false,
    [PatientField.gestationalAge]: false,
    [PatientField.gestationalAgeUnit]: false,
    [PatientField.drugHistory]: false,
    [PatientField.medicalHistory]: false,
  },
};

export type PatientState = typeof initialState;
