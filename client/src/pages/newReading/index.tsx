import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Typography from '@material-ui/core/Typography';
import { Button } from '@material-ui/core';
import { Symptoms } from './symptoms';
import { VitalSigns } from './vitalSigns';
import { Assessment } from './assessment';
import { Confirmation } from './confirmation';
import { Form, Formik, FormikHelpers } from 'formik';
import Stepper from '@material-ui/core/Stepper/Stepper';
import StepLabel from '@material-ui/core/StepLabel/StepLabel';
import Step from '@material-ui/core/Step/Step';
import { initialState, ReadingState } from './state';

export const NewReadingPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const [formState, setFormState] = useState(initialState);
  const [pageNum, setPageNum] = useState(0);

  const pages = [
    {
      name: 'Symptoms',
      component: Symptoms
    },
    {
      name: 'Vital Signs',
      component: VitalSigns
    },
    {
      name: 'Assessment',
      component: Assessment
    },
    {
      name: 'Confirmation',
      component: Confirmation
    }
  ];

  const PageComponent = pages[pageNum].component;
  const isFinalPage = pageNum === pages.length - 1;

  const handleBack = (values: ReadingState) => {
    setFormState(values);
    setPageNum(pageNum - 1);
  }

  const handleNext = (values: ReadingState, helpers: FormikHelpers<ReadingState>) => {
    if (isFinalPage) {
      alert('Create');
    } else {
      helpers.setTouched({});
      setFormState(values);
      setPageNum(pageNum + 1);
      helpers.setSubmitting(false);
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.title}>
        <Tooltip title="Go back" placement="top">
          <IconButton onClick={history.goBack}>
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Typography variant="h4">New Reading</Typography>
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
      <Formik
        initialValues={formState}
        onSubmit={handleNext}>
        {({values}) => (
          <Form>
            <PageComponent values={values} />
            <br />
            <Button
              color="primary"
              disabled={pageNum === 0}
              onClick={() => handleBack(values)}>
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              className={classes.right}
              type="submit">
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
