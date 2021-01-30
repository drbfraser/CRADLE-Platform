import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory, useRouteMatch } from 'react-router-dom';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Typography from '@material-ui/core/Typography';
import { Button } from '@material-ui/core';
import { Assessment } from './assessment';
import { Confirmation } from './confirmation';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import Stepper from '@material-ui/core/Stepper/Stepper';
import StepLabel from '@material-ui/core/StepLabel/StepLabel';
import Step from '@material-ui/core/Step/Step';
import { initialState, AssessmentState } from './state';
import { handleSubmit } from './handlers';
import { Toast } from '../../shared/components/toast';
import { ReduxState } from 'src/redux/reducers';
import { useSelector } from 'react-redux';
import { ActualUser } from '@types';

type RouteParams = {
  patientId: string;
  assessmentId: string | undefined;
};

export const NewAssessmentPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const { patientId } = useRouteMatch<RouteParams>().params;
  const [submitError, setSubmitError] = useState(false);
  const [pageNum, setPageNum] = useState(0);

  // TODO: remove userId once the backend grabs the userId instead
  const userId = useSelector(
    (state: ReduxState) => (state.user.current.data as ActualUser).userId
  );

  const pages = [
    {
      name: 'Assessment',
      component: Assessment,
    },
    {
      name: 'Confirmation',
      component: Confirmation,
    },
  ];

  const PageComponent = pages[pageNum].component;
  const isFinalPage = pageNum === pages.length - 1;

  const handleNext = async (
    values: AssessmentState,
    helpers: FormikHelpers<AssessmentState>
  ) => {
    if (isFinalPage) {
      const submitSuccess = await handleSubmit(patientId, values, userId);

      if (submitSuccess) {
        history.goBack();
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
    <div className={classes.container}>
      {submitError && (
        <Toast
          status="error"
          message="Something went wrong on our end. Please try that again."
          clearMessage={() => setSubmitError(false)}
        />
      )}
      <div className={classes.title}>
        <Tooltip title="Go back" placement="top">
          <IconButton onClick={history.goBack}>
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Typography variant="h4">New Assessment for ID {patientId}</Typography>
      </div>
      <br />
      <Stepper activeStep={pageNum}>
        {pages.map((page, idx) => (
          <Step key={idx}>
            <StepLabel>{page.name}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <br />
      <Formik initialValues={initialState} onSubmit={handleNext}>
        {(formikProps: FormikProps<AssessmentState>) => (
          <Form>
            <PageComponent formikProps={formikProps} />
            <br />
            <Button
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
