import { FormikProps } from 'formik';

export enum AssessmentField {
  investigation = 'investigation',
  finalDiagnosis = 'finalDiagnosis',
  treatment = 'treatment',
  medication = 'medication',
  followUp = 'followUp',
  followUpInstruc = 'followUpInstruc',
}

export const initialState = {
  [AssessmentField.investigation]: '',
  [AssessmentField.finalDiagnosis]: '',
  [AssessmentField.treatment]: '',
  [AssessmentField.medication]: '',
  [AssessmentField.followUp]: false,
  [AssessmentField.followUpInstruc]: '',
};

export type AssessmentState = typeof initialState;

export interface FormPageProps {
  formikProps: FormikProps<AssessmentState>;
}
