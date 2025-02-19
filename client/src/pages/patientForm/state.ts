import {
  getAgeBasedOnDOB,
  getNumOfMonthsNumeric,
  getNumOfWeeksDaysNumeric,
  getPrettyDate,
} from 'src/shared/utils';
import {
  getMedicalRecordAsync,
  getPatientPregnancyInfoAsync,
  getPregnancyAsync,
} from 'src/shared/api/api';

import { FormikProps } from 'formik';
import { GestationalAgeUnitEnum } from 'src/shared/enums';
import { gestationalAgeUnitLabels } from 'src/shared/constants';
import { MedicalRecord, Patient, Pregnancy } from 'src/shared/types';

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

export const getPatientState = async (
  patientId: string | undefined,
  universalMedicalId: string | undefined,
  editId: string | undefined
) => {
  // Return when creating new patient
  if (
    !patientId ||
    !editId ||
    (editId !== 'personalInfo' && !universalMedicalId)
  ) {
    return { ...initialState };
  }

  const pages: {
    [key: string]: (id: string) => Promise<Pregnancy & Patient & MedicalRecord>;
  } = {
    personalInfo: getPatientPregnancyInfoAsync,
    pregnancyInfo: getPregnancyAsync,
    drugHistory: getMedicalRecordAsync,
    medicalHistory: getMedicalRecordAsync,
  };

  const data = await pages[editId](
    editId === 'personalInfo' ? patientId : universalMedicalId!
  );

  const patientState: PatientState = {
    [PatientField.patientId]: data.id,
    [PatientField.patientName]: data.name,
    [PatientField.householdNumber]: data.householdNumber ?? '',
    [PatientField.isExactDateOfBirth]: Boolean(data.isExactDateOfBirth),
    [PatientField.dateOfBirth]: data.isExactDateOfBirth
      ? data.dateOfBirth ?? initialState.dateOfBirth
      : initialState.dateOfBirth,
    [PatientField.estimatedAge]: data.isExactDateOfBirth
      ? initialState.estimatedAge
      : String(getAgeBasedOnDOB(data.dateOfBirth!)),
    [PatientField.zone]: data.zone ?? '',
    [PatientField.villageNumber]: data.villageNumber,
    [PatientField.patientSex]: data.sex,
    [PatientField.isPregnant]: Boolean(data.isPregnant),
    [PatientField.gestationalAgeDays]: initialState.gestationalAgeDays,
    [PatientField.gestationalAgeWeeks]: initialState.gestationalAgeWeeks,
    [PatientField.gestationalAgeMonths]: initialState.gestationalAgeMonths,
    [PatientField.gestationalAgeUnit]: initialState.gestationalAgeUnit,
    [PatientField.drugHistory]: data.drugHistory ?? '',
    [PatientField.medicalHistory]: data.medicalHistory ?? '',
    [PatientField.allergy]: data.allergy ?? '',
    [PatientField.pregnancyOutcome]: data.outcome ?? '',
    [PatientField.pregnancyEndDate]:
      data.endDate?.toString() ?? initialState.pregnancyEndDate,
  };

  if (data.id) {
    patientState.gestationalAgeDays = String(
      getNumOfWeeksDaysNumeric(data.startDate, data.endDate).days
    );
    patientState.gestationalAgeWeeks = String(
      getNumOfWeeksDaysNumeric(data.startDate, data.endDate).weeks
    );
    patientState.gestationalAgeMonths = String(
      getNumOfMonthsNumeric(data.startDate, data.endDate)
    );
    if (data.endDate) {
      patientState.pregnancyEndDate = String(getPrettyDate(data.endDate));
    }
  }

  return patientState;
};

export interface FormPageProps {
  formikProps: FormikProps<PatientState>;
}
