export const GESTATIONAL_AGE_UNITS = {
  WEEKS: 'GESTATIONAL_AGE_UNITS_WEEKS',
  MONTHS: 'GESTATIONAL_AGE_UNITS_MONTHS',
};

export const GENDERS = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
};

export enum PatientField {
  patientId = 'patientId',
  patientName = 'patientName',
  householdNum = 'householdNum',
  isExactDob = 'isExactDob',
  dateOfBirth = 'dateOfBirth',
  estimatedAge = 'estimatedAge',
  zone = 'zone',
  village = 'village',
  gender = 'gender',
  pregnant = 'pregnant',
  gestationalAge = 'gestationalAge',
  gestationalAgeUnit = 'gestationalAgeUnit',
  drugHistory = 'drugHistory',
  medicalHistory = 'medicalHistory',
}

export const initialState = {
  [PatientField.patientId]: '',
  [PatientField.patientName]: '',
  [PatientField.householdNum]: '',
  [PatientField.isExactDob]: true,
  [PatientField.dateOfBirth]: '',
  [PatientField.estimatedAge]: '',
  [PatientField.zone]: '',
  [PatientField.village]: '',
  [PatientField.gender]: GENDERS.MALE,
  [PatientField.pregnant]: false,
  [PatientField.gestationalAge]: '',
  [PatientField.gestationalAgeUnit]: GESTATIONAL_AGE_UNITS.WEEKS,
  [PatientField.drugHistory]: '',
  [PatientField.medicalHistory]: '',
  error: {
    [PatientField.patientId]: false,
    [PatientField.patientName]: false,
    [PatientField.householdNum]: false,
    [PatientField.isExactDob]: false,
    [PatientField.dateOfBirth]: false,
    [PatientField.estimatedAge]: false,
    [PatientField.zone]: false,
    [PatientField.village]: false,
    [PatientField.gender]: false,
    [PatientField.pregnant]: false,
    [PatientField.gestationalAge]: false,
    [PatientField.gestationalAgeUnit]: false,
    [PatientField.drugHistory]: false,
    [PatientField.medicalHistory]: false,
  },
};

export type PatientState = typeof initialState;
