import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Form, Formik } from 'formik';
import { LinearProgress } from '@mui/material';

import { PrimaryButton } from 'src/shared/components/Button';
import { SexEnum } from 'src/shared/enums';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { PatientField, PatientState } from '../state';
import { useUpdatePatientMutation } from '../mutations';
import { personalInfoValidationSchema } from './personalInfo/validation';
import PatientFormHeader from './PatientFormHeader';
import { PersonalInfoForm } from './personalInfo';
import { getPatientPregnancyInfoAsync } from 'src/shared/api/api';

export type PatientData = {
  id: string;
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

export const getPatientData = (
  values: PatientState,
  patientId?: string
): PatientData => ({
  id: patientId ?? values[PatientField.patientId],
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

type RouteParams = {
  patientId: string;
};

const EditPersonalInfoForm = () => {
  const { patientId } = useParams() as RouteParams;
  const navigate = useNavigate();

  const updatePatient = useUpdatePatientMutation(patientId);

  const patientStateQuery = useQuery({
    queryKey: ['personalInfo', patientId],
    queryFn: () => getPatientPregnancyInfoAsync(patientId),
  });
  if (patientStateQuery.isPending || patientStateQuery.isError) {
    return <LinearProgress />;
  }

  const handleSubmit = (values: PatientState) => {
    const patientData = getPatientData(values, patientId);
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
        initialValues={patientStateQuery.data}
        validationSchema={personalInfoValidationSchema(false)}
        onSubmit={handleSubmit}>
        <Form>
          <PersonalInfoForm creatingNew={false} />
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
