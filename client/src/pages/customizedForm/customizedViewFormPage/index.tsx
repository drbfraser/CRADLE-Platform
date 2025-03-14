import { useParams } from 'react-router-dom';
import { Box, Skeleton, Stack } from '@mui/material';

import { FormRenderStateEnum } from 'src/shared/enums';
import usePatient from 'src/shared/hooks/patient';
import PatientHeader from 'src/shared/components/patientHeader/PatientHeader';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { CustomizedForm } from '../components/CustomizedForm';
import { useFormResponseQuery } from '../queries';

type RouteParams = {
  patientId: string;
  formId: string;
};

export const CustomizedViewFormPage = () => {
  const { patientId, formId } = useParams() as RouteParams;
  const { patient } = usePatient(patientId);

  const formResponseQuery = useFormResponseQuery(formId);
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
      <PatientHeader title="View Form" patient={patient} />

      {formResponseQuery.data.questions.length > 0 ? (
        <CustomizedForm
          patientId={patientId}
          fm={formResponseQuery.data}
          renderState={FormRenderStateEnum.VIEW}
        />
      ) : (
        <Box>Error: Form has no questions</Box>
      )}
    </>
  );
};
