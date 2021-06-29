import {
  getAgeBasedOnDOB,
  getNumOfMonthsNumeric,
  getNumOfWeeksDaysNumeric,
} from 'src/shared/utils';
import { apiFetch, API_URL } from 'src/shared/api';
import { GestationalAgeUnitEnum, EndpointEnum } from 'src/shared/enums';
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
  pregnancyOutcome = 'pregnancyOutcome',
  pregnancyEndDate = 'pregnancyEndDate',
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
  [PatientField.pregnancyOutcome]: '',
  [PatientField.pregnancyEndDate]: '',
};

export type PatientState = typeof initialState;

type Page = {
  endpoint: string;
};

export const getPatientState = async (
  patientId: string | undefined,
  universalMedicalId: string | undefined,
  editId: string | undefined
) => {
  //Return when creating new patient
  if (patientId === undefined) {
    return { ...initialState };
  }

  //Return when creating new pregnancy
  if (patientId && editId === undefined) {
    return { ...initialState };
  }

  //Return when creating new medical/drug history record
  if (
    patientId &&
    (editId === 'medicalHistory' || editId === 'drugHistory') &&
    universalMedicalId === undefined
  ) {
    return { ...initialState };
  }

  const pages: { [key: string]: Page } = {
    personalInfo: {
      endpoint:
        EndpointEnum.PATIENTS + '/' + patientId + EndpointEnum.PATIENT_INFO,
    },
    pregnancyInfo: {
      endpoint: EndpointEnum.PREGNANCIES + '/' + universalMedicalId,
    },
    drugHistory: {
      endpoint: EndpointEnum.MEDICAL_RECORDS + '/' + universalMedicalId,
    },
    medicalHistory: {
      endpoint: EndpointEnum.MEDICAL_RECORDS + '/' + universalMedicalId,
    },
  };

  const data = await (await apiFetch(API_URL + pages[editId!].endpoint)).json();

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
    [PatientField.pregnancyOutcome]: data.pregnancyOutcome ?? '',
    [PatientField.pregnancyEndDate]:
      data.pregnancyEndDate ?? initialState.pregnancyEndDate,
  };

  if (data.id && data.gestationalAgeUnit) {
    patientState.gestationalAgeDays = String(
      getNumOfWeeksDaysNumeric(data.pregnancyStartDate, null).days
    );
    patientState.gestationalAgeWeeks = String(
      getNumOfWeeksDaysNumeric(data.pregnancyStartDate, null).weeks
    );
    patientState.gestationalAgeMonths = String(
      getNumOfMonthsNumeric(data.pregnancyStartDate, null)
    );
  }

  return patientState;
};

export interface FormPageProps {
  formikProps: FormikProps<PatientState>;
}
