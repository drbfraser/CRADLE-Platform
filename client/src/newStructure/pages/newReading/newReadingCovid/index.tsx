import { ActualUser, OrNull, Patient } from '@types';
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
  addPatientNew,
  afterDoesPatientExist,
  afterNewPatientAdded,
  doesPatientExist,
} from '../../../redux/reducers/patients';
import {
  addReadingNew,
  resetNewReadingStatus,
} from '../../../redux/reducers/newReadingStatus';
import {
  formatPatientData,
  formatReadingData,
  formatReadingDataVHT,
} from './formatData';

import AlertDialog from './alertDialog';
import { Assessment } from './assessment';
import { ConfirmationPage } from './confirmationPage';
import { Demographics } from './demographic';
import { FormStatusEnum } from '../../../enums';
import { ReduxState } from '../../../redux/reducers';
import SubmissionDialog from './submissionDialog';
import { Symptoms } from './symptoms';
import { VitalSignAssessment } from './vitalSignAssessment';
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

type LocationState = {
  patient: OrNull<Patient>;
  status: FormStatusEnum;
};

interface IProps {
  getCurrentUser: any;
  afterNewPatientAdded: any;
  user: ActualUser;
  addPatientNew: any;
  doesPatientExist: any;
  addReadingNew: any;
  newPatientAdded: any;
  newPatientExist: boolean;
  patient: any;
  readingCreated: any;
  resetNewReadingStatus: any;
  patientFromEdit: OrNull<Patient>;
  formStatus: OrNull<FormStatusEnum>;
  afterDoesPatientExist: any;
}

const Page: React.FC<IProps> = (props) => {
  //styling
  const classes = useStyles();
  //stepper
  const [activeStep, setActiveStep] = React.useState(0);

  // ~~~~~~~~~~~~~~~ custome states for each component ~~~~~~~~~~~~~~~~~~~~~
  const {
    patient,
    handleChangePatient,
    initializeEditPatient,
    resetValuesPatient,
  } = useNewPatient();
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

  const [existingPatient, setExistingPatient] = useState(false);
  const [blockBackButton, setBlockBackButton] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [isShowDialogSubmission, setIsShowDialogsubmission] = useState(false);
  const [isShowDialogPatientCheck, setIsShowDialogPatientCheck] = useState(
    false
  );
  const [pageTitle, setPageTitle] = useState(
    'Create a New Patient and Reading'
  );
  const steps = getSteps(props.user.roles[0]);

  // ~~~~~~~~ Creating Reading  ~~~~~~~~~~~~~~~~~~
  const addReading = React.useCallback(() => {
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
  }, [assessment, props, selectedPatientId, symptoms, urineTest, vitals]);

  useEffect(() => {
    // getting current user
    if (!props.user.isLoggedIn) {
      props.getCurrentUser();
    }
    // flow for adding new patient + reading
    if (props.newPatientAdded) {
      addReading();
      props.afterNewPatientAdded();
      props.afterDoesPatientExist();
      setIsShowDialogsubmission(true);
    }
    // flow for using existing patient after typing id
    if (props.newPatientExist && existingPatient) {
      setSelectedPatientId(props.patient.patientId);
      setExistingPatient(false);
      setIsShowDialogPatientCheck(true);
    }
    // flow for NOT using existing patient after typing id
    if (!props.newPatientExist && existingPatient) {
      setSelectedPatientId(patient.patientId);
      setPageTitle(
        `Create a New Patient and Reading, ${patient.patientId} (${patient.patientInitial})`
      );
      setExistingPatient(false);
      setIsShowDialogPatientCheck(true);
    }
  }, [
    addReading,
    existingPatient,
    patient.patientId,
    patient.patientInitial,
    props,
    urineTest,
  ]);

  useEffect((): void => {
    if (props.formStatus) {
      switch (props.formStatus) {
        case FormStatusEnum.ADD_NEW_READING: {
          if (activeStep === 1) {
            setBlockBackButton(true);
          }
          break;
        }
        case FormStatusEnum.ADD_ASSESSMENT:
        case FormStatusEnum.UPDATE_ASSESSMENT: {
          if (activeStep === 3) {
            setBlockBackButton(true);
          }
          break;
        }
      }
    }
  }, [activeStep, props.formStatus]);

  // ~~~~~~~~ flow from patient list ~~~~~~~~~~~~
  // ~~~~~~~~ add new reading ~~~~~~~~~~~~
  // ~~~~~~~~ edit patient info ~~~~~~~~~~~~
  // ~~~~~~~~ create assessment ~~~~~~~~~~~~
  // ~~~~~~~~ update assessment~~~~~~~~~~~~
  useEffect(() => {
    if (props.patientFromEdit && props.formStatus) {
      switch (props.formStatus) {
        case FormStatusEnum.ADD_NEW_READING: {
          setPageTitle(
            `Create a New Reading, ${props.patientFromEdit.patientId} (${props.patientFromEdit.patientName})`
          );
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
          break;
        }
        case FormStatusEnum.EDIT_PATIENT_INFORMATION: {
          initializeEditPatient(props.patientFromEdit);
          setPageTitle(
            `Edit Patient Information, ${props.patientFromEdit.patientId}`
          );
          break;
        }
        case FormStatusEnum.ADD_ASSESSMENT: {
          setPageTitle(
            `Create Assessment, ${props.patientFromEdit.patientId} (${props.patientFromEdit.patientName})`
          );
          setActiveStep(3);
          break;
        }
        case FormStatusEnum.UPDATE_ASSESSMENT: {
          setPageTitle(
            `Update Assessment, ${props.patientFromEdit.patientId} (${props.patientFromEdit.patientName})`
          );
          setActiveStep(3);
          break;
        }
      }

      setBlockBackButton(true);
      setSelectedPatientId(props.patientFromEdit.patientId);
    }
  }, [initializeEditPatient, props.patientFromEdit, props.formStatus]);

  // ~~~~~~~~ Stepper Next button call ~~~~~~~~~~~~~~~~~~
  const handleNext = () => {
    if (
      activeStep === 0 &&
      props.formStatus === FormStatusEnum.EDIT_PATIENT_INFORMATION
    ) {
      setBlockBackButton(false);
      setActiveStep(4);
    } else if (activeStep === 0) {
      setExistingPatient(true);
      props.doesPatientExist(patient.patientId);
    } else {
      setBlockBackButton(false);
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  // ~~~~~~~~ Stepper Back button call ~~~~~~~~~~~~~~~~~~
  const handleBack = () => {
    if (activeStep === 2 && (props.newPatientExist || props.patientFromEdit)) {
      setBlockBackButton(true);
    } else if (
      activeStep === 4 &&
      props.formStatus === FormStatusEnum.EDIT_PATIENT_INFORMATION
    ) {
      setActiveStep(0);
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // ~~~~~~~~ Last Step Submission Call  ~~~~~~~~~~~
  const handleSubmit = () => {
    //if not an existing patient
    if (!props.newPatientExist && !props.patientFromEdit) {
      const formattedPatient = formatPatientData(patient);
      props.addPatientNew(formattedPatient);
    } else {
      addReading();
      props.afterNewPatientAdded();
      props.afterDoesPatientExist();
      setIsShowDialogsubmission(true);
    }
  };

  // ~~~~~~~~ Handle response from the existing patient Dialog  ~~~~~~~~~~~
  const handleDialogClose = (e: any) => {
    const value = e.currentTarget.value;
    if (value === 'no') {
      setIsShowDialogPatientCheck(false);
    }
    if (value === 'yes') {
      setIsShowDialogPatientCheck(false);
      setBlockBackButton(true);
      setPageTitle(
        `Create a New Reading, ${props.patient.patientId} (${props.patient.patientName})`
      );
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
    if (value === 'ok') {
      setIsShowDialogPatientCheck(false);
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  // ~~~~~~~~ Handle response from Submission dialog  ~~~~~~~~~~~
  const handleDialogCloseSubmission = (e: any) => {
    const value = e.currentTarget.value;
    if (value === 'ok') {
      setIsShowDialogsubmission(false);
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
    if (value === 'redo') {
      setIsShowDialogsubmission(false);
      handleReset();
    }
  };

  const isRequiredFilled = () => {
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

  const handleReset = () => {
    setActiveStep(0);
    resetValuesPatient(true);
    resetValuesSymptoms(true);
    resetValueVitals(true);
    resetValueAssessment(true);
    resetValueUrineTest(true);
    setBlockBackButton(false);
  };
  return (
    <div
      style={{
        maxWidth: 1200,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
      <h1 style={{ textAlign: 'center' }}>
        <b>{pageTitle}</b>
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
          urineTest={urineTest}
          isPatientExisting={
            props.newPatientExist || props.patientFromEdit ? true : false
          }></ConfirmationPage>
      ) : (
        ''
      )}
      <div>
        {activeStep === steps.length ? (
          <div>
            <Typography className={classes.instructions}>
              All steps completed
            </Typography>
            {/*need to be styled*/}
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
                  display:
                    props.formStatus ===
                      FormStatusEnum.EDIT_PATIENT_INFORMATION &&
                    activeStep !== 0
                      ? ``
                      : steps.length - 2 === activeStep ||
                        props.formStatus ===
                          FormStatusEnum.EDIT_PATIENT_INFORMATION
                      ? 'none'
                      : '',
                }}
                disabled={isRequiredFilled()}
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
                  display:
                    props.formStatus ===
                      FormStatusEnum.EDIT_PATIENT_INFORMATION &&
                    activeStep === 0
                      ? ``
                      : steps.length - 2 !== activeStep
                      ? 'none'
                      : '',
                }}
                disabled={
                  props.user.roles[0] === 'VHT' ||
                  props.formStatus === FormStatusEnum.EDIT_PATIENT_INFORMATION
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
                open={isShowDialogPatientCheck}
                patientExist={props.newPatientExist}
                patient={props.patient}
                handleDialogClose={handleDialogClose}></AlertDialog>
              <SubmissionDialog
                patientExist={props.newPatientExist}
                readingCreated={props.readingCreated}
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
}: ReduxState) => ({
  user: user.current.data,
  createReadingStatusError: newReadingStatus.error,
  readingCreated: newReadingStatus.readingCreated,
  newReadingData: newReadingStatus.message,
  newPatientAdded: patients.newPatientAdded,
  newPatientExist: patients.patientExist,
  patient: patients.existingPatient,
  patientFromEdit: router.location.state
    ? (router.location.state as LocationState).patient
    : null,
  formStatus: router.location.state
    ? (router.location.state as LocationState).status
    : null,
});

const mapDispatchToProps = (dispatch: any) => ({
  ...bindActionCreators(
    {
      getCurrentUser,
      resetNewReadingStatus,
      addPatientNew,
      addReadingNew,
      doesPatientExist,
      afterDoesPatientExist,
      afterNewPatientAdded,
    },
    dispatch
  ),
});
export const NewReadingCovid = connect(
  mapStateToProps,
  mapDispatchToProps
)(Page);
