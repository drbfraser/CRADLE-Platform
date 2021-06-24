import {
  getAgeBasedOnDOB,
  getNumOfMonthsNumeric,
  getNumOfWeeksDaysNumeric,
} from 'src/shared/utils';
import { apiFetch, API_URL } from 'src/shared/api';
import { EndpointEnum, GestationalAgeUnitEnum } from 'src/shared/enums';
import { gestationalAgeUnitLabels } from 'src/shared/constants';
import { FormikProps } from 'formik';

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
  allergy = 'allergy',
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
  [PatientField.patientSex]: '',
  [PatientField.isPregnant]: false,
  [PatientField.gestationalAgeDays]: '',
  [PatientField.gestationalAgeWeeks]: '',
  [PatientField.gestationalAgeMonths]: '',
  [PatientField.gestationalAgeUnit]: GestationalAgeUnitEnum.WEEKS,
  [PatientField.drugHistory]: '',
  [PatientField.medicalHistory]: '',
  [PatientField.allergy]: '',
};

export type PatientState = typeof initialState;

export const getPatientState = async (patientId: string | undefined) => {
  if (patientId === undefined) {
    return { ...initialState };
  }

  const data = await (
    await apiFetch(
      API_URL +
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
    [PatientField.gestationalAgeUnit]: data.gestationalAgeUnit ?? '',
    [PatientField.drugHistory]: data.drugHistory,
    [PatientField.medicalHistory]: data.medicalHistory,
    [PatientField.allergy]: data.allergy,
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

export interface FormPageProps {
  formikProps: FormikProps<PatientState>;
}
