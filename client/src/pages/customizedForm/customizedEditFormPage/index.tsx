import { CustomizedForm } from '../components/CustomizedForm';
import { getFormResponseAsync } from 'src/shared/api/api';
import { useParams } from 'react-router-dom';
import { FormRenderStateEnum } from 'src/shared/enums';
import { Box, Skeleton, Stack } from '@mui/material';
import usePatient from 'src/shared/hooks/patient';
import { useQuery } from '@tanstack/react-query';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import PatientHeader from 'src/shared/components/patientHeader/PatientHeader';

type RouteParams = {
  patientId: string;
  formId: string;
};

export const CustomizedEditFormPage = () => {
  const { patientId, formId } = useParams() as RouteParams;
  const { patient } = usePatient(patientId);

  const formResponseQuery = useQuery({
    queryKey: ['formResponse', formId],
    queryFn: () => getFormResponseAsync(formId),
  });

  if (formResponseQuery.isPending || formResponseQuery.isError) {
    return (
      <Stack gap={5}>
        {formResponseQuery.isError && <APIErrorToast />}
        <Skeleton variant="rectangular" height={100} />
        <Skeleton variant="rectangular" height={400} />
      </Stack>
    );
  }

  return (
    <>
      <PatientHeader title="Edit Form" patient={patient} />

      {formResponseQuery.data.questions.length > 0 ? (
        <CustomizedForm
          patientId={patientId}
          fm={formResponseQuery.data}
          renderState={FormRenderStateEnum.EDIT}
        />
      ) : (
        <Box>Error: Form has no questions</Box>
      )}
    </>
  );
};
