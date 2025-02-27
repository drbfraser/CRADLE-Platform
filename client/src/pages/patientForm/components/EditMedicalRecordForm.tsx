import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Formik } from 'formik';
import { Box, LinearProgress } from '@mui/material';

import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { ConfirmDialog } from 'src/shared/components/confirmDialog';
import { initialState, PatientField, PatientState } from '../state';
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
import { getMedicalRecordAsync } from 'src/shared/api/api';
import { useQuery } from '@tanstack/react-query';
import { PatientMedicalInfo } from 'src/shared/types';

const parseMedicalRecordQueryData = (data: PatientMedicalInfo) => {
  return {
    ...data,
    [PatientField.drugHistory]: data.drugHistory ?? '',
    [PatientField.medicalHistory]: data.medicalHistory ?? '',
  };
};

type RouteParams = {
  patientId: string;
  recordId: string;
};
type Props = {
  isDrugHistory: boolean;
};

const EditMedicalRecordForm = ({ isDrugHistory }: Props) => {
  const { patientId, recordId } = useParams() as RouteParams;
  const navigate = useNavigate();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const updateRecord = useUpdateMedicalRecordMutation(patientId, isDrugHistory);
  const deleteRecord = useDeleteMedicalRecordMutation(recordId);

  const medicalRecordQuery = useQuery({
    queryKey: ['medicalRecord', recordId],
    queryFn: () => getMedicalRecordAsync(recordId),
    select: parseMedicalRecordQueryData,
  });
  if (medicalRecordQuery.isPending || medicalRecordQuery.isError) {
    return <LinearProgress />;
  }

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

  const isPending = updateRecord.isPending || deleteRecord.isPending;
  return (
    <>
      {updateRecord.isError && (
        <APIErrorToast onClose={() => updateRecord.reset()} />
      )}
      {deleteRecord.isError && (
        <APIErrorToast onClose={() => deleteRecord.reset()} />
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

      <PatientFormHeader
        patientId={patientId}
        title={`Update ${isDrugHistory ? 'Drug' : 'Medical'} History `}
      />
      <Formik
        initialValues={
          // TODO: improve the typing here
          {
            ...initialState,
            ...medicalRecordQuery.data,
          } as unknown as PatientState
        }
        validationSchema={
          isDrugHistory
            ? drugHistoryValidationSchema
            : medicalHistoryValidationSchema
        }
        onSubmit={handleSubmit}>
        <Form>
          <MedicalInfoForm creatingNew={false} isDrugRecord={isDrugHistory} />

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
              sx={{ marginTop: '1rem', float: 'right' }}
              type="submit"
              disabled={isPending}>
              Save
            </PrimaryButton>
          </Box>
        </Form>
      </Formik>
    </>
  );
};

export default EditMedicalRecordForm;
