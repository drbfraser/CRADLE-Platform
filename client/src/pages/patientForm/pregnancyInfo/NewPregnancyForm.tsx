import { Form, Formik, FormikProps } from 'formik';
import { PrimaryButton } from 'src/shared/components/Button';
import { PatientState } from '../state';
import { PregnancyInfoForm } from '.';
import { EndpointEnum } from 'src/shared/enums';
import { API_URL, axiosFetch } from 'src/shared/api/api';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { AxiosError } from 'axios';
import { pregnancyInfoValidationSchema } from './validation';
import PatientFormHeader from '../PatientFormHeader';
import { processValues, SubmitValues } from './utils';

type Props = {
  initialState: PatientState;
  patientId: string;
};

const NewPregnancyForm = ({ initialState, patientId }: Props) => {
  const navigate = useNavigate();

  const addNewPregnancy = useMutation({
    mutationFn: (submitValues: SubmitValues) => {
      const endpoint =
        API_URL +
        EndpointEnum.PATIENTS +
        `/${patientId}` +
        EndpointEnum.PREGNANCIES;

      return axiosFetch(endpoint, { method: 'POST', data: submitValues }).catch(
        (e: AxiosError) => {
          let errorMessage = '';
          if (e.response?.status === 409) {
            errorMessage =
              'Failed to create pregnancy due to a conflict with the current pregnancy or previous pregnancies.';
          }
          throw new Error(errorMessage);
        }
      );
    },
  });

  const handleSubmit = (values: PatientState) => {
    const submitValues = { patientId, ...processValues(values) };
    addNewPregnancy.mutate(submitValues, {
      onSuccess: () => navigate(`/patients/${patientId}`),
    });
  };
  return (
    <>
      {addNewPregnancy.isError && !addNewPregnancy.isPending && (
        <APIErrorToast errorMessage={addNewPregnancy.error.message} />
      )}

      <PatientFormHeader patientId={patientId} title="Add New Pregnancy" />
      <Formik
        initialValues={initialState}
        validationSchema={pregnancyInfoValidationSchema}
        onSubmit={handleSubmit}>
        {(formikProps: FormikProps<PatientState>) => (
          <Form>
            <PregnancyInfoForm
              formikProps={formikProps}
              creatingNew={false}
              creatingNewPregnancy
            />

            <PrimaryButton
              sx={{ marginTop: '1rem', float: 'right' }}
              type="submit"
              disabled={addNewPregnancy.isPending}>
              Save
            </PrimaryButton>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default NewPregnancyForm;
