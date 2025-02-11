import { Form, Formik, FormikProps } from 'formik';
import { MedicalInfoForm } from '.';
import PatientFormHeader from '../PatientFormHeader';
import { PatientField, PatientState } from '../state';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import { useMutation } from '@tanstack/react-query';
import { API_URL, axiosFetch } from 'src/shared/api/api';
import { EndpointEnum } from 'src/shared/enums';
import { useNavigate } from 'react-router-dom';
import {
  drugHistoryValidationSchema,
  medicalHistoryValidationSchema,
} from './validation';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { ConfirmDialog } from 'src/shared/components/confirmDialog';
import { useState } from 'react';
import { Box } from '@mui/material';

type SubmitValues = {
  patientId: string;
  information: string;
};

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

  const updateRecord = useMutation({
    mutationFn: (submitValues: SubmitValues) => {
      const endpoint =
        API_URL +
        EndpointEnum.PATIENTS +
        `/${patientId}` +
        EndpointEnum.MEDICAL_RECORDS;

      return axiosFetch(endpoint, {
        method: 'POST',
        data: { ...submitValues, isDrugRecord: isDrugHistory },
      });
    },
  });
  const handleSubmit = (values: PatientState) => {
    const submitValues = {
      patientId,
      information: values[PatientField.medicalHistory],
    };
    updateRecord.mutate(submitValues, {
      onSuccess: () => navigate(`/patients/${patientId}`),
    });
  };

  const deleteRecord = useMutation({
    mutationFn: () => {
      const endpoint = API_URL + EndpointEnum.MEDICAL_RECORDS + `/${recordId}`;
      return axiosFetch(endpoint, { method: 'DELETE' });
    },
  });
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
