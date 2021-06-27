import {
  getAgeBasedOnDOB,
  getNumOfMonthsNumeric,
  getNumOfWeeksDaysNumeric,
} from 'src/shared/utils';
import { apiFetch, API_URL } from 'src/shared/api';
import {
  GestationalAgeUnitEnum,
  EndpointEnum,
  SexEnum,
} from 'src/shared/enums';
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
  pregnancyId = 'pregnancyId',
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
  outcome = 'outcome',
  endDate = 'endDate',
}

export const initialState = {
  [PatientField.patientId]: '',
  [PatientField.pregnancyId]: '',
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
  [PatientField.outcome]: '',
  [PatientField.endDate]: '',
};

export type PatientState = typeof initialState;

type Page = {
  endpoint: string;
};

export const getPatientState = async (
  patientId: string | undefined,
  pregnancyId: string | undefined,
  editId: string | undefined
) => {
  if (patientId === undefined) {
    return { ...initialState };
  }

  //Fetch user information by default if edit id is undefined
  if (patientId && editId === undefined) {
    editId = 'personalInfo';
  }

  const pages: { [key: string]: Page } = {
    personalInfo: {
      endpoint:
        EndpointEnum.PATIENTS + '/' + patientId + EndpointEnum.PATIENT_INFO,
    },
    pregnancyInfo: {
      endpoint: EndpointEnum.PREGNANCIES + '/' + pregnancyId,
    },
    drugHistory: {
      endpoint:
        EndpointEnum.PATIENTS + '/' + patientId + EndpointEnum.PATIENT_INFO,
    },
    medicalHistory: {
      endpoint:
        EndpointEnum.PATIENTS + '/' + patientId + EndpointEnum.PATIENT_INFO,
    },
    //TODO: Update medical endpoints here
  };

  const data = await (await apiFetch(API_URL + pages[editId!].endpoint)).json();

  console.log(data);

  const patientState: PatientState = {
    [PatientField.patientId]: data.patientId,
    [PatientField.pregnancyId]: data.id,
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
    [PatientField.gestationalAgeUnit]: data.defaultTimeUnit ?? '',
    [PatientField.drugHistory]: data.drugHistory,
    [PatientField.medicalHistory]: data.medicalHistory,
    [PatientField.allergy]: data.allergy,
    [PatientField.outcome]: data.outcome,
    [PatientField.endDate]: data.endDate,
  };

  if (data.id) {
    patientState.patientSex = SexEnum.FEMALE;
    patientState.gestationalAgeDays = String(
      getNumOfWeeksDaysNumeric(data.startDate).days
    );
    patientState.gestationalAgeWeeks = String(
      getNumOfWeeksDaysNumeric(data.startDate).weeks
    );
    patientState.gestationalAgeMonths = String(
      getNumOfMonthsNumeric(data.startDate)
    );
  }

  return patientState;
};

export interface FormPageProps {
  formikProps: FormikProps<PatientState>;
}
