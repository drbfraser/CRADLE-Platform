import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Formik, FormikProps } from 'formik';
import { Box } from '@mui/material';

import { ConfirmDialog } from 'src/shared/components/confirmDialog';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { PatientState } from '../state';
import {
  useDeletePregnancyMutation,
  useUpdatePregnancyMutation,
} from '../mutations';
import PatientFormHeader from './PatientFormHeader';
import { pregnancyInfoValidationSchema } from './pregnancyInfo/validation';
import { PregnancyInfoForm } from './pregnancyInfo';
import { getPregnancyValues } from './pregnancyInfo/utils';

type Props = {
  patientId: string;
  pregnancyId: string;
  initialState: PatientState;
};

const EditPregnancyForm = ({ patientId, pregnancyId, initialState }: Props) => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const updatePregnancy = useUpdatePregnancyMutation(pregnancyId);
  const deletePregnancy = useDeletePregnancyMutation(pregnancyId);

  const handleSubmit = (values: PatientState) => {
    const submitValues = { patientId, ...getPregnancyValues(values) };
    updatePregnancy.mutate(submitValues, {
      onSuccess: () => navigate(`/patients/${patientId}`),
    });
  };

  const handleDelete = () => {
    deletePregnancy.mutate(undefined, {
      onSuccess: () => navigate(`/patients/${patientId}`),
    });
  };

  const isPending = updatePregnancy.isPending || deletePregnancy.isPending;
  return (
    <>
      {updatePregnancy.isError && (
        <APIErrorToast onClose={() => updatePregnancy.reset()} />
      )}
      {deletePregnancy.isError && (
        <APIErrorToast onClose={() => deletePregnancy.reset()} />
      )}

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
              <CancelButton
                onClick={() => setIsDialogOpen(true)}
                disabled={isPending}>
                Delete
              </CancelButton>
              <PrimaryButton
                sx={{ float: 'right' }}
                type="submit"
                disabled={isPending}>
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
