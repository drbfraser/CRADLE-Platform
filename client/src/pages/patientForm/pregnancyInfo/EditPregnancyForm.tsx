import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { Form, Formik, FormikProps } from 'formik';
import { PatientState } from '../state';
import { pregnancyInfoValidationSchema } from './validation';
import { PregnancyInfoForm } from '.';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import { processValues, SubmitValues } from './utils';
import { useMutation } from '@tanstack/react-query';
import { API_URL, axiosFetch } from 'src/shared/api/api';
import { EndpointEnum } from 'src/shared/enums';
import { ConfirmDialog } from 'src/shared/components/confirmDialog';
import { useState } from 'react';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import PatientFormHeader from '../PatientFormHeader';

type Props = {
  patientId: string;
  pregnancyId: string;
  initialState: PatientState;
};

const EditPregnancyForm = ({ patientId, pregnancyId, initialState }: Props) => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const editPregnancy = useMutation({
    mutationFn: (submitValues: SubmitValues) => {
      const endpoint = API_URL + EndpointEnum.PREGNANCIES + `/${pregnancyId}`;
      return axiosFetch(endpoint, { method: 'PUT', data: submitValues });
    },
  });
  const handleSubmit = (values: PatientState) => {
    const submitValues = { patientId, ...processValues(values) };
    editPregnancy.mutate(submitValues, {
      onSuccess: () => navigate(`/patients/${patientId}`),
    });
  };

  const deletePregnancy = useMutation({
    mutationFn: () => {
      const endpoint = API_URL + EndpointEnum.PREGNANCIES + `/${pregnancyId}`;
      return axiosFetch(endpoint, { method: 'DELETE' });
    },
  });
  const handleDelete = () => {
    deletePregnancy.mutate(undefined, {
      onSuccess: () => navigate(`/patients/${patientId}`),
    });
  };

  const isError = editPregnancy.isError || deletePregnancy.isError;
  const isPending = editPregnancy.isPending || deletePregnancy.isPending;
  return (
    <>
      {isError && !isPending && <APIErrorToast />}

      <ConfirmDialog
        title="Delete Record?"
        content="Are you sure you want to delete this record?"
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={() => {
          handleDelete();
          setIsDialogOpen(false);
        }}
      />

      <PatientFormHeader patientId={patientId} title="Edit/Close Pregnancy" />
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

            <Box
              sx={{
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <CancelButton onClick={() => setIsDialogOpen(true)}>
                Delete
              </CancelButton>
              <PrimaryButton
                sx={{ float: 'right' }}
                type="submit"
                disabled={editPregnancy.isPending}>
                Save
              </PrimaryButton>
            </Box>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default EditPregnancyForm;
