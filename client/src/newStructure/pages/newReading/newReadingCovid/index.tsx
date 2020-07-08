import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import {
  Divider,
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
import { Assessment } from './assessment';
import { bindActionCreators } from 'redux';
import { getCurrentUser } from '../../../shared/reducers/user/currentUser';
import {
  addNewReading,
  resetNewReadingStatus,
} from '../../../shared/reducers/newReadingStatus';
import { addNewPatient } from '../../../shared/reducers/patients';
import { User } from '@types';
import { initialUrineTests } from '../urineTestForm';
import { useNewPatient } from './demographic/hooks';
import { useNewSymptoms } from './symptoms/hooks';
import { useNewVitals } from './vitalSignAssessment/hooks';
import { useNewAssessment } from './assessment/hooks';
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
interface IProps {
  getCurrentUser: any;
  afterNewPatientAdded: any;
  user: User;
  addNewReading: any;
}

const initState = {
  reading: {
    userId: '',
    readingId: '',
    dateTimeTaken: null,
    bpSystolic: '',
    bpDiastolic: '',
    heartRateBPM: '',
    dateRecheckVitalsNeeded: null,
    isFlaggedForFollowup: false,
    symptoms: '',
    urineTests: initialUrineTests,
  },
  showSuccessReading: false,
  hasUrineTest: false,
};
const Page: React.FC<IProps> = (props) => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const [state, setState] = React.useState(initState);
  const { patient, handleChangePatient } = useNewPatient();
  const { symptoms, handleChangeSymptoms } = useNewSymptoms();
  const { vitals, handleChangeVitals } = useNewVitals();
  const { assessment, handleChangeAssessment } = useNewAssessment();
  //make use state hook for each field group
  const steps = getSteps();

  useEffect(() => {
    if (!props.user.isLoggedIn) {
      props.getCurrentUser();
    }
  });

  const handleUrineTestChange = (e: any, value: any) => {
    setState({
      ...state,
      reading: {
        ...state.reading,
        urineTests: {
          ...state.reading.urineTests,
          [value.name]: value.value,
        },
      },
    });
  };

  const handleUrineTestSwitchChange = (e: any) => {
    console.log(e.target.checked);
    setState({
      hasUrineTest: e.target.checked,
    } as any);
    if (!e.target.checked) {
      setState({
        ...state,
        reading: {
          ...state.reading,
          urineTests: initialUrineTests,
        },
      });
    }
  };

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
      {activeStep === 0 ? (
        <Demographics
          patient={patient}
          onChange={handleChangePatient}></Demographics>
      ) : (
        ''
      )}
      {activeStep === 1 ? (
        <Symptoms
          symptoms={symptoms}
          onChange={handleChangeSymptoms}></Symptoms>
      ) : (
        ''
      )}
      {activeStep === 2 ? (
        <VitalSignAssessment
          vitals={vitals}
          hasUrineTest={state.hasUrineTest}
          reading={state.reading}
          onChange={handleChangeVitals}
          handleUrineTestChange={handleUrineTestChange}
          handleUrineTestSwitchChange={
            handleUrineTestSwitchChange
          }></VitalSignAssessment>
      ) : (
        ''
      )}
      {activeStep === 3 ? (
        <Assessment
          assessment={assessment}
          onChange={handleChangeAssessment}></Assessment>
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
const mapStateToProps = ({ user, newReadingStatus, patients }: any) => ({
  user: user.current.data,
  createReadingStatusError: newReadingStatus.error,
  readingCreated: newReadingStatus.readingCreated,
  newReadingData: newReadingStatus.message,
  newPatientAdded: patients.newPatientAdded,
});

const mapDispatchToProps = (dispatch: any) => ({
  ...bindActionCreators(
    {
      getCurrentUser,
      addNewReading,
      addNewPatient,
      resetNewReadingStatus,
      // afterNewPatientAdded
    },
    dispatch
  ),
});
export const NewReadingCovid = connect(
  mapStateToProps,
  mapDispatchToProps
)(Page);
