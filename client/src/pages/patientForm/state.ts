import {
  getAgeBasedOnDOB,
  getNumOfMonthsNumeric,
  getNumOfWeeksDaysNumeric,
  getPrettyDateTime,
} from 'src/shared/utils';
import {
  getMedicalRecordAsync,
  getPatientPregnancyInfoAsync,
  getPregnancyAsync,
} from 'src/shared/api';

import { FormikProps } from 'formik';
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

export const getPatientState = async (
  patientId: string | undefined,
  universalMedicalId: string | undefined,
  editId: string | undefined
) => {
  //Return when creating new patient
  if (
    !patientId ||
    !editId ||
    (editId !== 'personalInfo' && !universalMedicalId)
  ) {
    return { ...initialState };
  }

  const pages: { [key: string]: (id: string) => Promise<any> } = {
    personalInfo: getPatientPregnancyInfoAsync,
    pregnancyInfo: getPregnancyAsync,
    drugHistory: getMedicalRecordAsync,
    medicalHistory: getMedicalRecordAsync,
  };

  const data = await pages[editId!](
    editId === 'personalInfo' ? patientId : universalMedicalId!
  );

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
      getNumOfWeeksDaysNumeric(data.pregnancyStartDate, data.pregnancyEndDate)
        .days
    );
    patientState.gestationalAgeWeeks = String(
      getNumOfWeeksDaysNumeric(data.pregnancyStartDate, data.pregnancyEndDate)
        .weeks
    );
    patientState.gestationalAgeMonths = String(
      getNumOfMonthsNumeric(data.pregnancyStartDate, data.pregnancyEndDate)
    );
    if (data.pregnancyEndDate) {
      patientState.pregnancyEndDate = String(
        getPrettyDateTime(data.pregnancyEndDate)
      );
    }
  }

  return patientState;
};

export interface FormPageProps {
  formikProps: FormikProps<PatientState>;
}
