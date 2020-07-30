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
  addReadingAssessment,
} from '../../../shared/reducers/newReadingStatus';
import {
  addNewPatient,
  addPatientNew,
  doesPatientExist,
  afterDoesPatientExist,
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
import {
  formatPatientData,
  formatReadingData,
  formatReadingDataVHT,
} from './formatData';
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
  return roles === 'VHT'
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
  patient: any;
  addReadingAssessment: any;
  readingCreated: any;
  resetNewReadingStatus: any;
  patientFromEdit: any;
  afterDoesPatientExist: any;
}

const Page: React.FC<IProps> = (props) => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const { patient, handleChangePatient, resetValuesPatient } = useNewPatient();
  const [existingPatient, setExistingPatient] = useState(false);
  const {
    symptoms,
    handleChangeSymptoms,
    resetValuesSymptoms,
  } = useNewSymptoms();
  const { vitals, handleChangeVitals, resetValueVitals } = useNewVitals();
  const {
    assessment,
    handleChangeAssessment,
    resetValueAssessment,
  } = useNewAssessment();
  const {
    urineTest,
    handleChangeUrineTest,
    resetValueUrineTest,
  } = useNewUrineTest();
  const [isShowDialog, setIsShowDialog] = useState(false);
  const [blockBackButton, setblockBackButton] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [isShowDialogSubmission, setIsShowDialogsubmission] = useState(false);
  const steps = getSteps(props.user.roles[0]);

  useEffect(() => {
    if (!props.user.isLoggedIn) {
      props.getCurrentUser();
    }
    if (props.newPatientAdded) {
      console.log('newPatientAdded');
      addReading();
      props.afterNewPatientAdded();
      props.afterDoesPatientExist();
      setIsShowDialogsubmission(true);
    }
    if (props.newPatientExist && existingPatient) {
      console.log('props.newPatientExist && existingPatient');

      setSelectedPatientId(props.patient.patientId);
      setExistingPatient(false);
      setIsShowDialog(true);
    }
    if (!props.newPatientExist && existingPatient) {
      console.log('!props.newPatientExist && existingPatient');

      setSelectedPatientId(patient.patientId);
      setExistingPatient(false);
      setIsShowDialog(true);
    }
  });

  useEffect(() => {
    if (props.patientFromEdit) {
      console.log('props.patientFromEdit');

      setblockBackButton(true);
      setSelectedPatientId(props.patientFromEdit.patientId);
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  }, [props.patientFromEdit]);
  const handleNext = () => {
    if (activeStep === 0) {
      setExistingPatient(true);
      props.doesPatientExist(patient.patientId);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };
  const addReading = () => {
    if (props.user.roles[0] === 'VHT') {
      const formattedReading = formatReadingDataVHT(
        selectedPatientId,
        symptoms,
        urineTest,
        vitals,
        props.user.userId
      );
      props.addReadingNew(formattedReading);
    } else {
      const formattedReading = formatReadingData(
        selectedPatientId,
        symptoms,
        urineTest,
        vitals,
        assessment,
        props.user.userId
      );
      props.addReadingNew(formattedReading);
    }
  };

  const handleSubmit = () => {
    if (!props.newPatientExist || props.patientFromEdit) {
      const formattedPatient = formatPatientData(patient);
      props.addPatientNew(formattedPatient);
    } else {
      addReading();

      props.afterNewPatientAdded();
      props.afterDoesPatientExist();
      setIsShowDialogsubmission(true);
    }
  };

  const handleDialogClose = (e: any) => {
    const value = e.currentTarget.value;
    if (value === 'no') {
      setIsShowDialog(false);
    }
    if (value === 'yes') {
      //get the patient info and fill it out and make it none editable
      setIsShowDialog(false);
      setblockBackButton(true);
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
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
    console.log(patient);
    if (activeStep === 0) {
      if (
        !patient.patientId ||
        !patient.patientInitial ||
        (patient.isPregnant && !patient.gestationalAgeValue) ||
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
    resetValuesPatient(true);
    resetValuesSymptoms(true);
    resetValueVitals(true);
    resetValueAssessment(true);
    resetValueUrineTest(true);
    setblockBackButton(false);
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
          onChange={handleChangeVitals}
          urineTest={urineTest}
          urineTetsOnChange={handleChangeUrineTest}></VitalSignAssessment>
      ) : (
        ''
      )}
      {activeStep === 3 && props.user.roles[0] !== 'VHT' ? (
        <Assessment
          assessment={assessment}
          onChange={handleChangeAssessment}></Assessment>
      ) : (
        ''
      )}
      {activeStep === 4 ||
      (props.user.roles[0] === 'VHT' && activeStep === 3) ? (
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
                disabled={activeStep === 0 || blockBackButton}
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
                  props.user.roles[0] === 'VHT'
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
                patient={props.patient}
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
const mapStateToProps = ({
  user,
  newReadingStatus,
  patients,
  router,
}: any) => ({
  user: user.current.data,
  createReadingStatusError: newReadingStatus.error,
  readingCreated: newReadingStatus.readingCreated,
  newReadingData: newReadingStatus.message,
  newPatientAdded: patients.newPatientAdded,
  newPatientExist: patients.patientExist,
  patient: patients.patient,
  patientFromEdit: router.location.state ? router.location.state.patient : null,
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
      afterDoesPatientExist,
      afterNewPatientAdded,
      addReadingAssessment,
    },
    dispatch
  ),
});
export const NewReadingCovid = connect(
  mapStateToProps,
  mapDispatchToProps
)(Page);
