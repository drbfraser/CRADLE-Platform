import React, { useEffect, useState } from 'react';
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
  addReadingNew,
  resetNewReadingStatus,
} from '../../../shared/reducers/newReadingStatus';
import {
  addNewPatient,
  addPatientNew,
  doesPatientExist,
  afterNewPatientAdded,
} from '../../../shared/reducers/patients';
import { User } from '@types';
import { useNewPatient } from './demographic/hooks';
import { useNewSymptoms } from './symptoms/hooks';
import { useNewVitals } from './vitalSignAssessment/hooks';
import { useNewAssessment } from './assessment/hooks';
import { useNewUrineTest } from './urineTestAssessment/hooks';
import AlertDialog from './alertDialog';
import SubmissionDialog from './submissionDialog';
import { ConfirmationPage } from './confirmationPage';
import { formatPatientData, formatReadingData } from './formatData';
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
function getSteps(roles: string) {
  return roles === 'HCW'
    ? ['Demographic Information', 'Symptoms', 'Vitals Signs', 'Confirmation']
    : [
        'Demographic Information',
        'Symptoms',
        'Vitals Signs',
        'Assessments',
        'Confirmation',
      ];
}
interface IProps {
  getCurrentUser: any;
  afterNewPatientAdded: any;
  user: User;
  addNewReading: any;
  addNewPatient: any;
  addPatientNew: any;
  doesPatientExist: any;
  addReadingNew: any;
  newPatientAdded: any;
  newPatientExist: boolean;
}

const Page: React.FC<IProps> = (props) => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const { patient, handleChangePatient } = useNewPatient();
  const { symptoms, handleChangeSymptoms } = useNewSymptoms();
  const { vitals, handleChangeVitals } = useNewVitals();
  const { assessment, handleChangeAssessment } = useNewAssessment();
  const { urineTest, handleChangeUrineTest } = useNewUrineTest();
  const [isShowDialog, setIsShowDialog] = useState(false);
  const [isShowDialogSubmission, setIsShowDialogsubmission] = useState(false);
  const steps = getSteps(props.user.roles[0]);

  useEffect(() => {
    console.log('props  => ', props);
    if (!props.user.isLoggedIn) {
      props.getCurrentUser();
    }
    if (props.newPatientAdded) {
      const formattedReading = formatReadingData(
        patient,
        symptoms,
        urineTest,
        vitals,
        props.user.userId
      );
      props.addReadingNew(formattedReading);
      props.afterNewPatientAdded();
    }
  });

  const handleNext = () => {
    if (activeStep === 0) {
      props.doesPatientExist(patient.patientId);
      if (!props.newPatientExist) {
        setIsShowDialog(true);
        // setIsPatientCreated(true);
      }
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleSubmit = () => {
    // setIsShowDialogsubmission(true);
    const formattedPatient = formatPatientData(patient);
    props.addPatientNew(formattedPatient);

    /**/
    //  format Data --> probably another function or component
    //  if patient !exists
    //  this.props.addnewPatient(patient)
    //      handle error
    //      handle success
    //    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //  this.props.reading(reading)
    //      handle error
    //      handle success

    //    if roleid is not hcw
    //  this.props.assessment(assessment)
    //      handle error
    //      handle success
  };

  const handleDialogClose = (e: any) => {
    const value = e.currentTarget.value;
    if (value === 'no') {
      setIsShowDialog(false);
    }
    if (value === 'yes') {
      //get the patient info and fill it out
      setIsShowDialog(false);
    }
    if (value === 'ok') {
      setIsShowDialog(false);
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
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
        patient.patientInitialError ||
        patient.householdError ||
        patient.patientNameError ||
        patient.patientAgeError ||
        patient.patientSexError ||
        patient.isPregnantError ||
        patient.gestationalAgeValueError ||
        patient.gestationalAgeUnitError ||
        patient.zoneError ||
        patient.dobError ||
        patient.villageNumberError ||
        patient.drugHistoryError ||
        patient.medicalHistoryError
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
  // console.log('isPatientCreated', isPatientCreated);
  console.log('isPatientCreated', patient);
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
      {activeStep === 3 && props.user.roles[0] !== 'HCW' ? (
        <Assessment
          assessment={assessment}
          onChange={handleChangeAssessment}></Assessment>
      ) : (
        ''
      )}
      {activeStep === 4 ||
      (props.user.roles[0] === 'HCW' && activeStep === 3) ? (
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
                disabled={
                  props.user.roles[0] === 'HCW'
                    ? isRequiredFilled()
                      ? true
                      : false
                    : false
                }
                className={classes.nextButton}
                variant="contained"
                color="primary"
                onClick={handleNext}>
                Confirm
              </Button>
              <AlertDialog
                open={isShowDialog}
                patientExist={props.newPatientExist}
                patientId={patient.patientId}
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
const mapStateToProps = ({ user, newReadingStatus, patients }: any) => ({
  user: user.current.data,
  createReadingStatusError: newReadingStatus.error,
  readingCreated: newReadingStatus.readingCreated,
  newReadingData: newReadingStatus.message,
  newPatientAdded: patients.newPatientAdded,
  newPatientExist: patients.patientExist,
});

const mapDispatchToProps = (dispatch: any) => ({
  ...bindActionCreators(
    {
      getCurrentUser,
      addNewReading,
      addNewPatient,
      resetNewReadingStatus,
      addPatientNew,
      addReadingNew,
      doesPatientExist,
      afterNewPatientAdded,
    },
    dispatch
  ),
});
export const NewReadingCovid = connect(
  mapStateToProps,
  mapDispatchToProps
)(Page);
