import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Typography from '@material-ui/core/Typography';
import { Button } from '@material-ui/core';
import { PersonalInfoForm } from './personalInfoForm';
import { PregnancyInfoForm } from './pregnancyInfoForm';
import { MedicalInfoForm } from './MedicalInfoForm';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import Stepper from '@material-ui/core/Stepper/Stepper';
import StepLabel from '@material-ui/core/StepLabel/StepLabel';
import Step from '@material-ui/core/Step/Step';
import { initialState, PatientState } from './state';
import { handleSubmit } from './handlers';
import { goBackWithFallback } from 'src/shared/utils';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { personalInfoValidationSchema } from './personalInfoForm/validation';
import { pregnancyInfoValidationSchema } from './pregnancyInfoForm/validation';
import { useHistory } from 'react-router-dom';

export const NewPatientPage = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const isBigScreen = useMediaQuery(theme.breakpoints.up('sm'));

  const [submitError, setSubmitError] = useState(false);
  const [pageNum, setPageNum] = useState(0);

  const pages = [
    {
      name: 'Patient Personal Information',
      component: PersonalInfoForm,
      validationSchema: personalInfoValidationSchema(true),
    },
    {
      name: 'Pregnancy Information',
      component: PregnancyInfoForm,
      validationSchema: pregnancyInfoValidationSchema,
    },
    {
      name: 'Medical Information',
      component: MedicalInfoForm,
      validationSchema: undefined,
    },
  ];

  const PageComponent = pages[pageNum].component;
  const isFinalPage = pageNum === pages.length - 1;

  const handleNext = async (
    values: PatientState,
    helpers: FormikHelpers<PatientState>
  ) => {
    if (isFinalPage) {
      handleSubmit(values, true, history);
    } else {
      helpers.setTouched({});
      helpers.setSubmitting(false);
      setPageNum(pageNum + 1);
    }
  };

  return (
    <div className={classes.container}>
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <div className={classes.title}>
        <Tooltip title="Go back" placement="top">
          <IconButton onClick={() => goBackWithFallback(`/patients`)}>
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Typography variant="h4">New Patient</Typography>
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
      <Formik
        initialValues={initialState}
        onSubmit={handleNext}
        validationSchema={pages[pageNum].validationSchema}>
        {(formikProps: FormikProps<PatientState>) => (
          <Form>
            <PageComponent formikProps={formikProps} />
            <br />
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setPageNum(pageNum - 1)}
              disabled={pageNum === 0 || formikProps.isSubmitting}>
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              className={classes.right}
              type="submit"
              disabled={formikProps.isSubmitting}>
              {isFinalPage ? 'Create' : 'Next'}
            </Button>
          </Form>
        )}
      </Formik>
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
