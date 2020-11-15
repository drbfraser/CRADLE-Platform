import { PatientField } from './state';

export enum PatientAction {
  CLEAR_FORM = 'NEW_PATIENT_CLEAR_FORM',
  SET_FIELD = 'NEW_PATIENT_SET_FIELD',
}

export const clearPatientForm = () => ({
  type: PatientAction.CLEAR_FORM,
});

export const setPatientField = (field: PatientField, value: any) => ({
  type: PatientAction.SET_FIELD,
  field,
  value,
});
