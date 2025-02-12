import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Formik, FormikProps } from 'formik';
import { Box } from '@mui/material';

import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { ConfirmDialog } from 'src/shared/components/confirmDialog';
import { PatientField, PatientState } from '../state';
import {
  useDeleteMedicalRecordMutation,
  useUpdateMedicalRecordMutation,
} from '../mutations';
import {
  drugHistoryValidationSchema,
  medicalHistoryValidationSchema,
} from './medicalInfo/validation';
import { MedicalInfoForm } from './medicalInfo';
import PatientFormHeader from './PatientFormHeader';

type Props = {
  patientId: string;
  recordId: string;
  initialState: PatientState;
  isDrugHistory: boolean;
};

const EditMedicalRecordForm = ({
  patientId,
  recordId,
  initialState,
  isDrugHistory,
}: Props) => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const updateRecord = useUpdateMedicalRecordMutation(patientId, isDrugHistory);
  const deleteRecord = useDeleteMedicalRecordMutation(recordId);

  const handleSubmit = (values: PatientState) => {
    const submitValues = {
      patientId,
      information: isDrugHistory
        ? values[PatientField.drugHistory]
        : values[PatientField.medicalHistory],
    };
    updateRecord.mutate(submitValues, {
      onSuccess: () => navigate(`/patients/${patientId}`),
    });
  };

  const handleDelete = () => {
    deleteRecord.mutate(undefined, {
      onSuccess: () => navigate(`/patients/${patientId}`),
    });
  };

  const isError = updateRecord.isError || deleteRecord.isError;
  const isPending = updateRecord.isPending || deleteRecord.isPending;
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

      <PatientFormHeader
        patientId={patientId}
        title={`Update ${isDrugHistory ? 'Drug' : 'Medical'} History `}
      />
      <Formik
        initialValues={initialState}
        validationSchema={
          isDrugHistory
            ? drugHistoryValidationSchema
            : medicalHistoryValidationSchema
        }
        onSubmit={handleSubmit}>
        {(formikProps: FormikProps<PatientState>) => (
          <Form>
            <MedicalInfoForm
              formikProps={formikProps}
              creatingNew={false}
              isDrugRecord={isDrugHistory}
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
                sx={{ marginTop: '1rem', float: 'right' }}
                type="submit"
                disabled={updateRecord.isPending}>
                Save
              </PrimaryButton>
            </Box>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default EditMedicalRecordForm;
