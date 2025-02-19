import { GestationalAgeUnitEnum } from 'src/shared/enums';
import { gestationalAgeUnitLabels } from 'src/shared/constants';

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
  patientId = 'id',
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
  [PatientField.patientId]: '',
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

export type PatientState = typeof initialState;
