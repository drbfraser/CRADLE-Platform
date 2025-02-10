import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import {
  Box,
  LinearProgress,
  Step,
  Stepper,
  StepLabel,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { PrimaryButton, SecondaryButton } from 'src/shared/components/Button';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import PatientHeader from 'src/shared/components/patientHeader/PatientHeader';
import usePatient from 'src/shared/hooks/patient';
import { VitalSigns } from './vitalSigns';
import { vitalSignsValidationSchema } from './vitalSigns/validation';
import { Symptoms } from './symptoms';
import { ReadingState, getReadingState } from './state';
import { Confirmation } from './confirmation';
import { useAddReadingMutation } from './mutations';

type RouteParams = {
  patientId: string;
};

const pages = [
  {
    name: 'Symptoms',
    component: Symptoms,
    validationSchema: undefined,
  },
  {
    name: 'Vital Signs',
    component: VitalSigns,
    validationSchema: vitalSignsValidationSchema,
  },
  {
    name: 'Confirmation',
    component: Confirmation,
    validationSchema: undefined,
  },
];

export const ReadingFormPage = () => {
  const theme = useTheme();
  const isBigScreen = useMediaQuery(theme.breakpoints.up('lg'));

  const navigate = useNavigate();
  const { patientId } = useParams() as RouteParams;
  const { patient } = usePatient(patientId);

  const [pageNum, setPageNum] = useState(0);
  const PageComponent = pages[pageNum].component;
  const isFinalPage = pageNum === pages.length - 1;

  const readingQuery = useQuery({
    queryKey: ['patientReading', patientId],
    queryFn: () => getReadingState(patientId),
  });

  const addReading = useAddReadingMutation(
    patientId,
    readingQuery.data?.drugHistory
  );

  const handleNextStep = (
    values: ReadingState,
    helpers: FormikHelpers<ReadingState>
  ) => {
    if (isFinalPage) {
      addReading.mutate(values, {
        onSuccess: () => navigate(`/patients/${patientId}`),
      });
    } else {
      helpers.setTouched({});
      setPageNum(pageNum + 1);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        margin: '0 auto',
        maxWidth: '1250px',
      }}>
      {(addReading.isError || readingQuery.isError) &&
        !addReading.isPending && <APIErrorToast />}

      <PatientHeader title="New Reading" patient={patient} />

      <Stepper
        activeStep={pageNum}
        orientation={isBigScreen ? 'horizontal' : 'vertical'}>
        {pages.map((page, idx) => (
          <Step key={idx}>
            <StepLabel>{page.name}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {readingQuery.isPending || readingQuery.isError ? (
        <LinearProgress />
      ) : (
        <Formik
          initialValues={readingQuery.data}
          onSubmit={handleNextStep}
          validationSchema={pages[pageNum].validationSchema}>
          {(formikProps: FormikProps<ReadingState>) => (
            <Form>
              <PageComponent formikProps={formikProps} />

              <Box sx={{ marginTop: '2rem' }}>
                <SecondaryButton
                  onClick={() => setPageNum(pageNum - 1)}
                  disabled={pageNum === 0 || addReading.isPending}>
                  Back
                </SecondaryButton>
                <PrimaryButton
                  sx={{ float: 'right' }}
                  type="submit"
                  disabled={addReading.isPending}>
                  {isFinalPage ? 'Create' : 'Next'}
                </PrimaryButton>
              </Box>
            </Form>
          )}
        </Formik>
      )}
    </Box>
  );
};
