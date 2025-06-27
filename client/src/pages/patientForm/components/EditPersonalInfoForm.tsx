import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Form, Formik } from 'formik';
import { LinearProgress } from '@mui/material';

import { PrimaryButton } from 'src/shared/components/Button';
import { SexEnum } from 'src/shared/enums';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { initialState, PatientField, PatientState } from '../state';
import { useUpdatePatientMutation } from '../mutations';
import { personalInfoValidationSchema } from './personalInfo/validation';
import PatientFormHeader from './PatientFormHeader';
import { PersonalInfoForm } from './personalInfo';
import { getPatientInfoAsync } from 'src/shared/api';
import { Patient } from 'src/shared/types/patientTypes';
import { getAgeBasedOnDOB } from 'src/shared/utils';

export type PatientData = {
  name: string;
  householdNumber: string;
  isExactDateOfBirth: boolean;
  dateOfBirth: string;
  zone: string;
  villageNumber: string;
  sex: SexEnum;
  drugHistory: string;
  medicalHistory: string;
  allergy: string;
};

export const getPatientData = (values: PatientState): PatientData => ({
  name: values[PatientField.patientName],
  householdNumber: values[PatientField.householdNumber],
  isExactDateOfBirth: Boolean(values[PatientField.isExactDateOfBirth]),
  dateOfBirth: values[PatientField.dateOfBirth],
  zone: values[PatientField.zone],
  villageNumber: values[PatientField.villageNumber],
  sex: values[PatientField.patientSex] as SexEnum,
  drugHistory: values[PatientField.drugHistory],
  medicalHistory: values[PatientField.medicalHistory],
  allergy: values[PatientField.allergy],
});

const parsePatientQueryData = (data: Patient) => {
  return {
    ...data,
    [PatientField.householdNumber]: data.householdNumber ?? '',
    [PatientField.dateOfBirth]:
      data.isExactDateOfBirth && data.dateOfBirth !== null
        ? data.dateOfBirth
        : '',
    [PatientField.estimatedAge]:
      !data.isExactDateOfBirth && data.dateOfBirth !== null
        ? String(getAgeBasedOnDOB(data.dateOfBirth))
        : '',
  };
};

type RouteParams = {
  patientId: string;
};

const EditPersonalInfoForm = () => {
  const { patientId } = useParams() as RouteParams;
  const navigate = useNavigate();

  const updatePatient = useUpdatePatientMutation(patientId);

  const patientInfoQuery = useQuery({
    queryKey: ['personalInfo', patientId],
    queryFn: () => getPatientInfoAsync(patientId),
    select: parsePatientQueryData,
  });
  if (patientInfoQuery.isPending || patientInfoQuery.isError) {
    return <LinearProgress />;
  }

  const handleSubmit = (values: PatientState) => {
    const patientData = getPatientData(values);
    updatePatient.mutate(patientData, {
      onSuccess: () => navigate(`/patients/${patientId}`),
    });
  };

  return (
    <>
      {updatePatient.isError && (
        <APIErrorToast onClose={() => updatePatient.reset()} />
      )}

      <PatientFormHeader
        patientId={patientId}
        title="Edit Personal Information"
      />
      <Formik
        initialValues={
          // TODO: improve the typing here
          {
            ...initialState,
            ...patientInfoQuery.data,
          } as unknown as PatientState
        }
        validationSchema={personalInfoValidationSchema}
        onSubmit={handleSubmit}>
        <Form>
          <PersonalInfoForm />
          <PrimaryButton
            sx={{ marginTop: '1rem', float: 'right' }}
            type="submit"
            disabled={updatePatient.isPending}>
            Save
          </PrimaryButton>
        </Form>
      </Formik>
    </>
  );
};

export default EditPersonalInfoForm;
