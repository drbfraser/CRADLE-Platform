import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Formik, FormikProps } from 'formik';
import { useQuery } from '@tanstack/react-query';
import { Box, LinearProgress } from '@mui/material';

import { ConfirmDialog } from 'src/shared/components/confirmDialog';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { initialState, PatientField, PatientState } from '../state';
import {
  useDeletePregnancyMutation,
  useUpdatePregnancyMutation,
} from '../mutations';
import PatientFormHeader from './PatientFormHeader';
import { pregnancyInfoValidationSchema } from './pregnancyInfo/validation';
import { PregnancyInfoForm } from './pregnancyInfo';
import { getPregnancyValues } from './pregnancyInfo/utils';
import { getPregnancyAsync } from 'src/shared/api';
import { GestationalAgeUnitEnum } from 'src/shared/enums';
import { Pregnancy } from 'src/shared/types/types';
import {
  getNumOfMonthsNumeric,
  getNumOfWeeksDaysNumeric,
} from 'src/shared/utils';

type RouteParams = {
  patientId: string;
  recordId: string;
};

const parsePregnancyData = (data: Pregnancy) => {
  const { days, weeks } = getNumOfWeeksDaysNumeric(
    data.startDate,
    data.endDate
  );
  const months = getNumOfMonthsNumeric(data.startDate, data.endDate);

  return {
    ...data,
    [PatientField.pregnancyEndDate]: data.endDate?.toString() ?? '',
    [PatientField.gestationalAgeUnit]: GestationalAgeUnitEnum.WEEKS,
    [PatientField.gestationalAgeDays]: String(days),
    [PatientField.gestationalAgeWeeks]: String(weeks),
    [PatientField.gestationalAgeMonths]: String(months),
  };
};

const EditPregnancyForm = () => {
  const { patientId, recordId } = useParams() as RouteParams;
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const updatePregnancy = useUpdatePregnancyMutation(recordId);
  const deletePregnancy = useDeletePregnancyMutation(recordId);

  const pregnancyRecordQuery = useQuery({
    queryKey: ['pregnancyRecord', recordId],
    queryFn: () => getPregnancyAsync(recordId),
    select: parsePregnancyData,
  });
  if (pregnancyRecordQuery.isPending || pregnancyRecordQuery.isError) {
    return <LinearProgress />;
  }

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
        initialValues={
          // TODO: improve the typing here
          {
            ...initialState,
            ...pregnancyRecordQuery.data,
          } as unknown as PatientState
        }
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
