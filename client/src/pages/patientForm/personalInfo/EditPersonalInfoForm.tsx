import { Form, Formik, FormikProps } from 'formik';
import PatientFormHeader from '../PatientFormHeader';
import { PatientField, PatientState } from '../state';
import { PersonalInfoForm } from '.';
import { PrimaryButton } from 'src/shared/components/Button';
import { personalInfoValidationSchema } from './validation';
import { API_URL, axiosFetch } from 'src/shared/api/api';
import { EndpointEnum, SexEnum } from 'src/shared/enums';
import { useMutation } from '@tanstack/react-query';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { useNavigate } from 'react-router-dom';

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

type Props = {
  patientId: string;
  initialState: PatientState;
};

const EditPersonalInfoForm = ({ patientId, initialState }: Props) => {
  const navigate = useNavigate();

  const editPatient = useMutation({
    mutationFn: (patientData: PatientData) => {
      const endpoint =
        API_URL +
        EndpointEnum.PATIENTS +
        `/${patientId}` +
        EndpointEnum.PATIENT_INFO;
      return axiosFetch(endpoint, {
        method: 'PUT',
        data: patientData,
      });
    },
  });

  const handleSubmit = (values: PatientState) => {
    const patientData = getPatientData(values, patientId);
    editPatient.mutate(patientData, {
      onSuccess: () => navigate(`/patients/${patientId}`),
    });
  };

  return (
    <>
      {editPatient.isError && !editPatient.isPending && <APIErrorToast />}

      <PatientFormHeader
        patientId={patientId}
        title="Edit Personal Information"
      />
      <Formik
        initialValues={initialState}
        validationSchema={personalInfoValidationSchema(false)}
        onSubmit={handleSubmit}>
        {(formikProps: FormikProps<PatientState>) => (
          <Form>
            <PersonalInfoForm formikProps={formikProps} creatingNew={false} />

            <PrimaryButton
              sx={{ marginTop: '1rem', float: 'right' }}
              type="submit"
              disabled={editPatient.isPending}>
              Save
            </PrimaryButton>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default EditPersonalInfoForm;
