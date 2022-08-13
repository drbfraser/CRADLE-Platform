import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import { PrimaryButton, SecondaryButton } from 'src/shared/components/Button';
import React, { useEffect, useState } from 'react';
import { ReadingState, getReadingState } from './state';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { Confirmation } from './confirmation';
import IconButton from '@material-ui/core/IconButton';
import LinearProgress from '@material-ui/core/LinearProgress';
import Step from '@material-ui/core/Step/Step';
import StepLabel from '@material-ui/core/StepLabel/StepLabel';
import Stepper from '@material-ui/core/Stepper/Stepper';
import { Symptoms } from './symptoms';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { VitalSigns } from './vitalSigns';
import { goBackWithFallback } from 'src/shared/utils';
import { handleSubmit } from './handlers';
import { makeStyles } from '@material-ui/core/styles';
import { useDimensionsContext } from 'src/app/context/hooks';
import { useRouteMatch } from 'react-router-dom';
import { vitalSignsValidationSchema } from './vitalSigns/validation';

type RouteParams = {
  patientId: string;
};

export const ReadingFormPage = () => {
  const classes = useStyles();
  const { isBigScreen } = useDimensionsContext();

  const { patientId } = useRouteMatch<RouteParams>().params;
  const [submitError, setSubmitError] = useState(false);
  const [pageNum, setPageNum] = useState(0);
  const [formInitialState, setFormInitialState] = useState<ReadingState>(); // change needed in the ReadingState?
  const [drugHistory, setDrugHistory] = useState('');

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

  const PageComponent = pages[pageNum].component;
  const isFinalPage = pageNum === pages.length - 1;

  const handleNext = async (
    values: ReadingState,
    helpers: FormikHelpers<ReadingState>
  ) => {
    if (isFinalPage) {
      const submitSuccess = await handleSubmit(patientId, values, drugHistory);

      if (submitSuccess) {
        goBackWithFallback(`/patients/${patientId}`);
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

  useEffect(() => {
    getReadingState(patientId).then((state) => {
      setDrugHistory(state.drugHistory);
      setFormInitialState(state);
    });
  }, [patientId]);

  return (
    <div className={classes.container}>
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <div className={classes.title}>
        <Tooltip title="Go back" placement="top">
          <IconButton
            onClick={() => goBackWithFallback(`/patients/${patientId}`)}>
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Typography variant="h4">
          New Reading for Patient {patientId}
        </Typography>
      </div>
      <br />
      <Stepper
        activeStep={pageNum}
        orientation={isBigScreen ? 'horizontal' : 'vertical'}>
        {pages.map((page, idx) => (
          <Step key={idx}>
            <StepLabel>{page.name}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <br />
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
              <br />
              <SecondaryButton
                onClick={() => setPageNum(pageNum - 1)}
                disabled={pageNum === 0 || formikProps.isSubmitting}>
                Back
              </SecondaryButton>
              <PrimaryButton
                className={classes.right}
                type="submit"
                disabled={formikProps.isSubmitting}>
                {isFinalPage ? 'Create' : 'Next'}
              </PrimaryButton>
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
};

const useStyles = makeStyles({
  container: {
    maxWidth: 1250,
    margin: '0 auto',
  },
  title: {
    display: `flex`,
    alignItems: `center`,
  },
  right: {
    float: 'right',
  },
});
