import {
  getAgeBasedOnDOB,
  getNumOfMonthsNumeric,
  getNumOfWeeksDaysNumeric,
} from 'src/shared/utils';
import { EndpointEnum } from 'src/server';
import { BASE_URL } from 'src/server/utils';
import { apiFetch } from 'src/shared/utils/api';
import { GestationalAgeUnitEnum, gestationalAgeUnitLabels } from 'src/enums';

export const SEXES = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
};

export const sexOptions = [
  { name: 'Male', value: SEXES.MALE },
  { name: 'Female', value: SEXES.FEMALE },
];

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
  gestationalAgeDays = 'gestationalAgeDays',
  gestationalAgeWeeks = 'gestationalAgeWeeks',
  gestationalAgeMonths = 'gestationalAgeMonths',
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
  [PatientField.gestationalAgeDays]: '',
  [PatientField.gestationalAgeWeeks]: '',
  [PatientField.gestationalAgeMonths]: '',
  [PatientField.gestationalAgeUnit]: GestationalAgeUnitEnum.WEEKS,
  [PatientField.drugHistory]: '',
  [PatientField.medicalHistory]: '',
};

export type PatientState = typeof initialState;

export const getPatientState = async (patientId: string | undefined) => {
  if (patientId === undefined) {
    return { ...initialState };
  }

  const data = await (
    await apiFetch(
      BASE_URL +
        EndpointEnum.PATIENTS +
        '/' +
        patientId +
        EndpointEnum.PATIENT_INFO
    )
  ).json();

  const patientState: PatientState = {
    [PatientField.patientId]: data.patientId,
    [PatientField.patientName]: data.patientName,
    [PatientField.householdNumber]: data.householdNumber,
    [PatientField.isExactDob]: Boolean(data.isExactDob),
    [PatientField.dob]: data.isExactDob ? data.dob : initialState.dob,
    [PatientField.estimatedAge]: data.isExactDob
      ? initialState.estimatedAge
      : String(getAgeBasedOnDOB(data.dob)),
    [PatientField.zone]: data.zone,
    [PatientField.villageNumber]: data.villageNumber,
    [PatientField.patientSex]: data.patientSex,
    [PatientField.isPregnant]: Boolean(data.isPregnant),
    [PatientField.gestationalAgeDays]: initialState.gestationalAgeDays,
    [PatientField.gestationalAgeWeeks]: initialState.gestationalAgeWeeks,
    [PatientField.gestationalAgeMonths]: initialState.gestationalAgeMonths,
    [PatientField.gestationalAgeUnit]: data.gestationalAgeUnit,
    [PatientField.drugHistory]: data.drugHistory,
    [PatientField.medicalHistory]: data.medicalHistory,
  };

  if (patientState.isPregnant) {
    patientState.gestationalAgeDays = String(
      getNumOfWeeksDaysNumeric(data.gestationalTimestamp).days
    );
    patientState.gestationalAgeWeeks = String(
      getNumOfWeeksDaysNumeric(data.gestationalTimestamp).weeks
    );
    patientState.gestationalAgeMonths = String(
      getNumOfMonthsNumeric(data.gestationalTimestamp)
    );
  }

  return patientState;
};
