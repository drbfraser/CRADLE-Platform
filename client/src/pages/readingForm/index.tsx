import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Step from '@mui/material/Step/Step';
import StepLabel from '@mui/material/StepLabel/StepLabel';
import Stepper from '@mui/material/Stepper/Stepper';
import { Symptoms } from './symptoms';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Box, useMediaQuery, useTheme } from '@mui/material';

import { PrimaryButton, SecondaryButton } from 'src/shared/components/Button';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { VitalSigns } from './vitalSigns';
import { vitalSignsValidationSchema } from './vitalSigns/validation';
import { ReadingState, getReadingState } from './state';
import { Confirmation } from './confirmation';
import { handleSubmit } from './handlers';

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

  const { patientId } = useParams() as RouteParams;
  const navigate = useNavigate();

  const [submitError, setSubmitError] = useState(false);
  const [pageNum, setPageNum] = useState(0);
  const [formInitialState, setFormInitialState] = useState<ReadingState>(); // change needed in the ReadingState?
  const [drugHistory, setDrugHistory] = useState('');

  useEffect(() => {
    getReadingState(patientId).then((state) => {
      setDrugHistory(state.drugHistory);
      setFormInitialState(state);
    });
  }, [patientId]);

  const PageComponent = pages[pageNum].component;
  const isFinalPage = pageNum === pages.length - 1;

  const handleNext = async (
    values: ReadingState,
    helpers: FormikHelpers<ReadingState>
  ) => {
    if (isFinalPage) {
      const submitSuccess = await handleSubmit(patientId, values, drugHistory);

      if (submitSuccess) {
        navigate(`/patients/${patientId}`);
      } else {
        setSubmitError(true);
        helpers.setSubmitting(false);
      }
    } else {
      helpers.setTouched({});
      helpers.setSubmitting(false);
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
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />

      <Box sx={{ display: `flex`, alignItems: `center` }}>
        <Tooltip title="Go back" placement="top">
          <IconButton
            onClick={() => navigate(`/patients/${patientId}`)}
            size="large">
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Typography variant={'h4'} component={'h4'}>
          New Reading for Patient {patientId}
        </Typography>
      </Box>

      <Stepper
        activeStep={pageNum}
        orientation={isBigScreen ? 'horizontal' : 'vertical'}>
        {pages.map((page, idx) => (
          <Step key={idx}>
            <StepLabel>{page.name}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {formInitialState === undefined ? (
        <LinearProgress />
      ) : (
        <Formik
          initialValues={formInitialState}
          onSubmit={handleNext}
          validationSchema={pages[pageNum].validationSchema}>
          {(formikProps: FormikProps<ReadingState>) => (
            <Form>
              <PageComponent formikProps={formikProps} />

              <Box sx={{ marginTop: '2rem' }}>
                <SecondaryButton
                  onClick={() => setPageNum(pageNum - 1)}
                  disabled={pageNum === 0 || formikProps.isSubmitting}>
                  Back
                </SecondaryButton>
                <PrimaryButton
                  sx={{ float: 'right' }}
                  type="submit"
                  disabled={formikProps.isSubmitting}>
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
