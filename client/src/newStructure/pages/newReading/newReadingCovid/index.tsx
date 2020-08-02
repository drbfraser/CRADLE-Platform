import {
  Button,
  Divider,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import {
  clearCreateReadingOutcome,
  createReading,
} from '../../../redux/reducers/reading';

import { ActualUser } from '@types';
import AlertDialog from './alertDialog';
import { Assessment } from './assessment';
import { ConfirmationPage } from './confirmationPage';
import { Demographics } from './demographic';
import SubmissionDialog from './submissionDialog';
import { Symptoms } from './symptoms';
import { VitalSignAssessment } from './vitalSignAssessment';
import { addNewPatient } from '../../../redux/reducers/patients';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getCurrentUser } from '../../../redux/reducers/user/currentUser';
import { useNewAssessment } from './assessment/hooks';
import { useNewPatient } from './demographic/hooks';
import { useNewSymptoms } from './symptoms/hooks';
import { useNewUrineTest } from './urineTestAssessment/hooks';
import { useNewVitals } from './vitalSignAssessment/hooks';

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
    'Confirmation',
  ];
}

interface IProps {
  getCurrentUser: any;
  afterNewPatientAdded: any;
  user: ActualUser;
  createReading: any;
}

// const initState = {
//   reading: {
//     userId: '',
//     readingId: '',
//     dateTimeTaken: null,
//     bpSystolic: '',
//     bpDiastolic: '',
//     heartRateBPM: '',
//     dateRecheckVitalsNeeded: null,
//     isFlaggedForFollowup: false,
//     symptoms: '',
//     urineTests: initialUrineTests,
//   },
//   showSuccessReading: false,
//   hasUrineTest: false,
// };
const Page: React.FC<IProps> = (props) => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const { patient, handleChangePatient } = useNewPatient();
  const { symptoms, handleChangeSymptoms } = useNewSymptoms();
  const { vitals, handleChangeVitals } = useNewVitals();
  const { assessment, handleChangeAssessment } = useNewAssessment();
  const { urineTest, handleChangeUrineTest } = useNewUrineTest();
  const [isPatientCreated, setIsPatientCreated] = useState(false);
  const [isShowDialog, setIsShowDialog] = useState(false);
  const [isShowDialogSubmission, setIsShowDialogsubmission] = useState(false);
  const steps = getSteps();

  useEffect(() => {
    if (!props.user.isLoggedIn) {
      props.getCurrentUser();
    }
  });

  const handleNext = () => {
    if (activeStep === 0) {
      setIsPatientCreated(true);
      setIsShowDialog(true);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };
  const handleSubmit = () => {
    setIsShowDialogsubmission(true);
  };

  const handleDialogClose = () => {
    setIsShowDialog(false);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  const handleDialogCloseSubmission = () => {
    setIsShowDialogsubmission(false);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const isRequiredFilled = () => {
    if (activeStep === 0) {
      if (
        !patient.patientId ||
        !patient.patientInitial ||
        patient.patientIdError ||
        patient.patientInitialError
      ) {
        return true;
      }
    }
    if (activeStep === 2) {
      if (
        !vitals.bpSystolic ||
        vitals.bpSystolicError ||
        !vitals.bpSystolic ||
        vitals.bpSystolicError ||
        !vitals.heartRateBPM ||
        vitals.heartRateBPMError
      ) {
        return true;
      }
      if (urineTest.enabled) {
        if (
          !urineTest.blood ||
          !urineTest.glucose ||
          !urineTest.protein ||
          !urineTest.nitrites ||
          !urineTest.leukocytes
        ) {
          return true;
        }
      }
    }
    return false;
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };
  console.log('isPatientCreated', isPatientCreated);
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
          onChange={handleChangeVitals}
          urineTest={urineTest}
          urineTetsOnChange={handleChangeUrineTest}></VitalSignAssessment>
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
      {activeStep === 4 ? (
        <ConfirmationPage
          patient={patient}
          symptoms={symptoms}
          vitals={vitals}
          assessment={assessment}
          urineTest={urineTest}></ConfirmationPage>
      ) : (
        ''
      )}
      <div>
        {activeStep === steps.length ? (
          <div>
            <Typography className={classes.instructions}>
              All steps completed
            </Typography>
            <Button onClick={handleReset}>Create New Patient/Reading</Button>
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
                style={{
                  display: steps.length - 2 === activeStep ? 'none' : '',
                }}
                disabled={isRequiredFilled() ? true : false}
                className={classes.nextButton}
                variant="contained"
                color="primary"
                onClick={
                  activeStep === steps.length - 1 ? handleSubmit : handleNext
                }>
                {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
              </Button>
              <Button
                style={{
                  display: steps.length - 2 !== activeStep ? 'none' : '',
                }}
                className={classes.nextButton}
                variant="contained"
                color="primary"
                onClick={handleNext}>
                Confirm
              </Button>
              <AlertDialog
                open={isShowDialog}
                handleDialogClose={handleDialogClose}></AlertDialog>
              <SubmissionDialog
                open={isShowDialogSubmission}
                handleDialogClose={
                  handleDialogCloseSubmission
                }></SubmissionDialog>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
const mapStateToProps = ({ user, reading, patients }: any) => ({
  user: user.current.data,
  createReadingStatusError: reading.error,
  readingCreated: reading.readingCreated,
  newReadingData: reading.message,
  newPatientAdded: patients.newPatientAdded,
});

const mapDispatchToProps = (dispatch: any) => ({
  ...bindActionCreators(
    {
      getCurrentUser,
      createReading,
      addNewPatient,
      clearCreateReadingOutcome,
      // afterNewPatientAdded
    },
    dispatch
  ),
});
export const NewReadingCovid = connect(
  mapStateToProps,
  mapDispatchToProps
)(Page);
