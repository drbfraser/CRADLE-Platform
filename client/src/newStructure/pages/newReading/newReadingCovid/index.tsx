import React from 'react';
import { connect } from 'react-redux';
import {
  Divider,
  FormControl,
  Input,
  InputLabel,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Button,
} from '@material-ui/core';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { Demographics } from './demographic';
import { Symptoms } from './symptoms';
import { VitalSignAssessment } from './vitalSignAssessment';
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > *': {
        margin: theme.spacing(2),
      },
    },
    formField: {
      margin: theme.spacing(2),
      minWidth: '22ch',
    },
    formFieldDM: {
      margin: theme.spacing(2),
      minWidth: '48ch',
      minHeight: '15ch',
    },
    formControl: {
      margin: theme.spacing(3),
    },
    backButton: {
      margin: theme.spacing(2),
    },
    nextButton: {
      margin: theme.spacing(2),
      float: 'right',
    },
    instructions: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    formFieldWide: {
      margin: theme.spacing(2),
      minWidth: '56ch',
    },
    formFieldSWide: {
      margin: theme.spacing(2),
      minWidth: '36ch',
    },
  })
);
function getSteps() {
  return [
    'Collect basic demographic info',
    'Collect symptoms',
    'Vitals sign assessment',
    'Assessment',
  ];
}

const Page: React.FC<any> = () => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };
  return (
    <div
      style={{
        maxWidth: 1200,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
      <h1 style={{ textAlign: 'center' }}>
        <b>Create a New Reading</b>
      </h1>
      <Divider />
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {activeStep === 0 ? <Demographics></Demographics> : ''}
      {activeStep === 1 ? <Symptoms></Symptoms> : ''}
      {activeStep === 2 ? <VitalSignAssessment></VitalSignAssessment> : ''}
      {activeStep === 3 ? (
        <Paper
          style={{
            padding: '35px 25px',
            marginTop: '2%',
            borderRadius: '15px',
          }}>
          <h1>
            <b>Assessment</b>
          </h1>

          <form className={classes.root} noValidate autoComplete="off">
            <FormControl className={classes.formFieldWide}>
              <InputLabel required htmlFor="component-simple">
                Special Inestigation + Results (if avaulable)
              </InputLabel>
              <Input id="component-outlined" />
            </FormControl>
            <FormControl className={classes.formFieldWide}>
              <InputLabel required htmlFor="component-outlined">
                Final Diagnosis
              </InputLabel>
              <Input id="component-outlined" />
            </FormControl>
            <FormControl className={classes.formFieldWide}>
              <InputLabel required htmlFor="component-outlined">
                Treatment/Operation
              </InputLabel>
              <Input id="component-outlined" />
            </FormControl>
            <FormControl className={classes.formFieldWide}>
              <InputLabel required htmlFor="component-outlined">
                Medication Prescribed
              </InputLabel>
              <Input id="component-outlined" />
            </FormControl>
            <FormControl className={classes.formFieldWide}>
              <InputLabel htmlFor="component-outlined">Frequesncy</InputLabel>
              <Input id="component-outlined" />
            </FormControl>
            <FormControl className={classes.formFieldWide}>
              <InputLabel htmlFor="component-outlined">
                Frequency Unit
              </InputLabel>
              <Input id="component-outlined" />
            </FormControl>
            <FormControl className={classes.formFieldSWide}>
              <InputLabel htmlFor="component-outlined">Until</InputLabel>
              <Input id="component-outlined" />
            </FormControl>
            <FormControl className={classes.formFieldSWide}>
              <InputLabel htmlFor="component-outlined">Until Date</InputLabel>
              <Input id="component-outlined" />
            </FormControl>
            <FormControl className={classes.formFieldSWide}>
              <InputLabel htmlFor="component-outlined">Other</InputLabel>
              <Input id="component-outlined" />
            </FormControl>
          </form>
        </Paper>
      ) : (
        ''
      )}
      <div>
        {activeStep === steps.length ? (
          <div>
            <Typography className={classes.instructions}>
              All steps completed
            </Typography>
            <Button onClick={handleReset}>Reset</Button>
          </div>
        ) : (
          <div>
            <div>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                className={classes.backButton}>
                Back
              </Button>
              <Button
                className={classes.nextButton}
                variant="contained"
                color="primary"
                onClick={handleNext}>
                {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});
export const NewReadingCovid = connect(
  mapStateToProps,
  mapDispatchToProps
)(Page);
