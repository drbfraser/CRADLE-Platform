import { GestationalAgeUnitEnum } from 'src/shared/enums';
import { gestationalAgeUnitLabels } from 'src/shared/constants';
import { Moment } from 'moment';

export const gestationalAgeUnitOptions = [
  {
    name: gestationalAgeUnitLabels[GestationalAgeUnitEnum.WEEKS],
    value: GestationalAgeUnitEnum.WEEKS,
  },
  {
    name: gestationalAgeUnitLabels[GestationalAgeUnitEnum.MONTHS],
    value: GestationalAgeUnitEnum.MONTHS,
  },
];

export enum PatientField {
  patientName = 'name',
  householdNumber = 'householdNumber',
  isExactDateOfBirth = 'isExactDateOfBirth',
  dateOfBirth = 'dateOfBirth',
  estimatedAge = 'estimatedAge',
  zone = 'zone',
  villageNumber = 'villageNumber',
  patientSex = 'sex',
  isPregnant = 'isPregnant',
  gestationalAgeDays = 'gestationalAgeDays',
  gestationalAgeWeeks = 'gestationalAgeWeeks',
  gestationalAgeMonths = 'gestationalAgeMonths',
  gestationalAgeUnit = 'gestationalAgeUnit',
  drugHistory = 'drugHistory',
  medicalHistory = 'medicalHistory',
  allergy = 'allergy',
  pregnancyOutcome = 'pregnancyOutcome',
  pregnancyEndDate = 'pregnancyEndDate',
}

export const initialState = {
  [PatientField.patientName]: '',
  [PatientField.householdNumber]: '',
  [PatientField.isExactDateOfBirth]: true,
  [PatientField.dateOfBirth]: '',
  [PatientField.estimatedAge]: '',
  [PatientField.zone]: '',
  [PatientField.villageNumber]: '',
  [PatientField.patientSex]: '',
  [PatientField.isPregnant]: false,
  [PatientField.gestationalAgeDays]: '',
  [PatientField.gestationalAgeWeeks]: '',
  [PatientField.gestationalAgeMonths]: '',
  [PatientField.gestationalAgeUnit]: GestationalAgeUnitEnum.WEEKS,
  [PatientField.drugHistory]: '',
  [PatientField.medicalHistory]: '',
  [PatientField.allergy]: '',
  [PatientField.pregnancyOutcome]: '',
  [PatientField.pregnancyEndDate]: '',
};

export type DateOfBirthFieldType = Moment | null | undefined;
export type PatientState = typeof initialState;
// export type PatientState = typeof _initialState & {
//   [PatientField.dateOfBirth]: DateOfBirthFieldType;
// };

// export const initialState: PatientState = {
//   ..._initialState,
//   [PatientField.dateOfBirth]: undefined,
// };
