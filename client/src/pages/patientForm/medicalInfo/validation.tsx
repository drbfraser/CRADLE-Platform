import * as Yup from 'yup';
import { PatientField } from '../state';

export const drugHistoryValidationSchema = () =>
  Yup.object().shape({
    [PatientField.drugHistory]: Yup.string().label('Drug history').required(),
  });

export const medicalHistoryValidationSchema = () =>
  Yup.object().shape({
    [PatientField.medicalHistory]: Yup.string()
      .label('Medical history')
      .required(),
  });
