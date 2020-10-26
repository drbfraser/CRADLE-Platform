import { ActualUser, Callback, FollowUp, OrNull, Patient } from '@types';
import { Button, Divider, Step, StepLabel, Stepper } from '@material-ui/core';
import { Dispatch, bindActionCreators } from 'redux';
import {
  ICreateAssessmentArgs,
  IUpdateAssessmentArgs,
  IUpdatePatientArgs,
  addPatientNew,
  afterDoesPatientExist,
  afterNewPatientAdded,
  clearCreateAssessmentOutcome,
  clearUpdateAssessmentOutcome,
  clearUpdatePatientOutcome,
  createAssessment,
  doesPatientExist,
  updateAssessment,
  updatePatient,
} from '../../redux/reducers/patients';
import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import {
  addReadingNew,
  resetNewReadingStatus,
} from '../../redux/reducers/newReadingStatus';
import {
  formatPatientData,
  formatReadingData,
  formatReadingDataVHT,
} from './formatData';

import AlertDialog from './alertDialog';
import { Assessment } from './assessment';
import { ConfirmationPage } from './confirmationPage';
import { Demographics } from './demographic';
import { FormStatusEnum } from '../../enums';
import { ReduxState } from '../../redux/reducers';
import SubmissionDialog from './submissionDialog';
import { Symptoms } from './symptoms';
import { VitalSignAssessment } from './vitalSignAssessment';
import { connect } from 'react-redux';
import { getCurrentUser } from '../../redux/reducers/user/currentUser';
import { goBack } from 'connected-react-router';
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

function getSteps(roles: string, formStatus: OrNull<FormStatusEnum>) {
  switch (formStatus) {
    case FormStatusEnum.EDIT_PATIENT_INFORMATION:
      return [`Demographic Information`, `Confirmation`];
    case FormStatusEnum.ADD_ASSESSMENT:
    case FormStatusEnum.UPDATE_ASSESSMENT:
      return [`Assessments`, `Confirmation`];
    case FormStatusEnum.ADD_NEW_READING:
    default:
      return roles === `VHT`
        ? [
            `Demographic Information`,
            `Symptoms`,
            `Vitals Signs`,
            `Confirmation`,
          ]
        : [
            `Demographic Information`,
            `Symptoms`,
            `Vitals Signs`,
            `Assessments`,
            `Confirmation`,
          ];
  }
}

type LocationState = {
  patient: Patient;
  status: FormStatusEnum;
  assessment?: FollowUp;
  readingId?: string;
  userId?: OrNull<number>;
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
  error: OrNull<string>;
  success: OrNull<string>;
  assessmentFromEdit: OrNull<FollowUp>;
  formStatus: OrNull<FormStatusEnum>;
  patientFromEdit: OrNull<Patient>;
  readingId: OrNull<string>;
  userId: OrNull<number>;
  afterDoesPatientExist: any;
  createAssessment: Callback<ICreateAssessmentArgs>;
  updateAssessment: Callback<IUpdateAssessmentArgs>;
  updatePatient: Callback<IUpdatePatientArgs>;
  clearCreateAssessmentOutcome: () => void;
  clearUpdateAssessmentOutcome: () => void;
  clearUpdatePatientOutcome: () => void;
  goBackToPatientPage: () => void;
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
    initializeAssessment,
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
  const steps = getSteps(props.user.roles[0], props.formStatus);

  // ~~~~~~~~ Creating Reading  ~~~~~~~~~~~~~~~~~~
  const addReading = React.useCallback(() => {
    if (props.user.roles[0] === 'VHT') {
      const formattedReading = formatReadingDataVHT(
        selectedPatientId,
        symptoms,
        urineTest.enabled ? urineTest : null,
        vitals,
        props.user.userId
      );
      props.addReadingNew(formattedReading);
    } else {
      const formattedReading = formatReadingData(
        selectedPatientId,
        symptoms,
        urineTest.enabled ? urineTest : null,
        vitals,
        assessment,
        props.user.userId
      );
      props.addReadingNew(formattedReading);
    }
  }, [assessment, props, selectedPatientId, symptoms, urineTest, vitals]);

  useEffect((): void => {
    if (props.error || props.success) {
      setIsShowDialogsubmission(true);
    }
  }, [props.error, props.success]);

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
        `Create a New Patient and Reading, ${patient.patientId} (${patient.patientName})`
      );
      setExistingPatient(false);
      setIsShowDialogPatientCheck(true);
    }
  }, [
    addReading,
    existingPatient,
    patient.patientId,
    patient.patientName,
    props,
    urineTest,
  ]);

  // ~~~~~~~~ flow from patient list ~~~~~~~~~~~~
  // ~~~~~~~~ add new reading ~~~~~~~~~~~~
  // ~~~~~~~~ edit patient info ~~~~~~~~~~~~
  // ~~~~~~~~ add assessment ~~~~~~~~~~~~
  // ~~~~~~~~ update assessment~~~~~~~~~~~~
  useEffect(() => {
    if (props.patientFromEdit) {
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
          break;
        }
        case FormStatusEnum.UPDATE_ASSESSMENT: {
          initializeAssessment(props.assessmentFromEdit);
          setPageTitle(
            `Update Assessment, ${props.patientFromEdit.patientId} (${props.patientFromEdit.patientName})`
          );
          break;
        }
      }

      setBlockBackButton(true);
      setSelectedPatientId(props.patientFromEdit.patientId);
    }
  }, [
    initializeEditPatient,
    initializeAssessment,
    props.assessmentFromEdit,
    props.patientFromEdit,
    props.formStatus,
  ]);

  // ~~~~~~~~ Stepper Next button call ~~~~~~~~~~~~~~~~~~
  const handleNext = () => {
    if (
      activeStep === 0 &&
      !(
        props.formStatus === FormStatusEnum.EDIT_PATIENT_INFORMATION ||
        props.formStatus === FormStatusEnum.ADD_ASSESSMENT ||
        props.formStatus === FormStatusEnum.UPDATE_ASSESSMENT
      )
    ) {
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
    }
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // ~~~~~~~~ Last Step Submission Call  ~~~~~~~~~~~
  const handleSubmit = () => {
    if (props.formStatus === FormStatusEnum.EDIT_PATIENT_INFORMATION) {
      props.updatePatient({
        data: formatPatientData(patient),
      });
    } else if (props.formStatus === FormStatusEnum.ADD_ASSESSMENT) {
      if (props.readingId && props.userId) {
        props.createAssessment({
          data: {
            diagnosis: assessment.finalDiagnosis,
            followupNeeded: assessment.enabled,
            followupInstructions: assessment.InstructionFollow,
            medicationPrescribed: assessment.medPrescribed,
            specialInvestigations: assessment.specialInvestigations,
            treatment: assessment.treatmentOP,
          },
          readingId: props.readingId,
          userId: props.userId,
        });
      } else {
        throw new Error(
          `Invalid action: Reading ID and User ID from patient page corrupted!`
        );
      }
    } else if (props.formStatus === FormStatusEnum.UPDATE_ASSESSMENT) {
      if (props.assessmentFromEdit && props.readingId && props.userId) {
        props.updateAssessment({
          data: {
            id: props.assessmentFromEdit.id,
            followupNeeded: assessment.enabled,
            followupInstructions: assessment.InstructionFollow,
            diagnosis: assessment.finalDiagnosis,
            medicationPrescribed: assessment.medPrescribed,
            specialInvestigations: assessment.specialInvestigations,
            treatment: assessment.treatmentOP,
          },
          readingId: props.readingId,
          userId: props.userId,
        });
      } else {
        throw new Error(
          `Invalid action: Assessment from patient page corrupted!`
        );
      }
    } else if (!props.newPatientExist && !props.patientFromEdit) {
      //if not an existing patient
      const formattedPatient = formatPatientData(patient);
      props.addPatientNew(formattedPatient);
    } else {
      addReading();
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
    switch (props.formStatus) {
      case FormStatusEnum.EDIT_PATIENT_INFORMATION: {
        props.clearUpdatePatientOutcome();
        break;
      }
      case FormStatusEnum.ADD_ASSESSMENT: {
        props.clearCreateAssessmentOutcome();
        break;
      }
      case FormStatusEnum.UPDATE_ASSESSMENT: {
        props.clearUpdateAssessmentOutcome();
        break;
      }
    }

    if (props.formStatus) {
      props.goBackToPatientPage();
      return;
    }

    const value = e.currentTarget.value;
    props.afterNewPatientAdded();
    props.afterDoesPatientExist();
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
        !patient.patientName ||
        (patient.isPregnant && !patient.gestationalAgeValue) ||
        patient.patientIdError ||
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
    setPageTitle('Create a New Patient and Reading');
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
      {activeStep === 0 &&
      props.formStatus !== FormStatusEnum.ADD_ASSESSMENT &&
      props.formStatus !== FormStatusEnum.UPDATE_ASSESSMENT ? (
        <Demographics
          patient={patient}
          showPatientId={
            props.formStatus !== FormStatusEnum.EDIT_PATIENT_INFORMATION
          }
          onChange={handleChangePatient}></Demographics>
      ) : (
        ''
      )}
      {activeStep === 1 &&
      props.formStatus !== FormStatusEnum.EDIT_PATIENT_INFORMATION &&
      props.formStatus !== FormStatusEnum.ADD_ASSESSMENT &&
      props.formStatus !== FormStatusEnum.UPDATE_ASSESSMENT ? (
        <Symptoms
          symptoms={symptoms}
          onChange={handleChangeSymptoms}></Symptoms>
      ) : (
        ''
      )}
      {activeStep === 2 &&
      props.formStatus !== FormStatusEnum.EDIT_PATIENT_INFORMATION &&
      props.formStatus !== FormStatusEnum.ADD_ASSESSMENT &&
      props.formStatus !== FormStatusEnum.UPDATE_ASSESSMENT ? (
        <VitalSignAssessment
          vitals={vitals}
          onChange={handleChangeVitals}
          urineTest={urineTest}
          urineTetsOnChange={handleChangeUrineTest}></VitalSignAssessment>
      ) : (
        ''
      )}
      {(activeStep === 3 && props.user.roles[0] !== 'VHT') ||
      (activeStep === 0 &&
        (props.formStatus === FormStatusEnum.ADD_ASSESSMENT ||
          props.formStatus === FormStatusEnum.UPDATE_ASSESSMENT)) ? (
        <Assessment
          assessment={assessment}
          onChange={handleChangeAssessment}></Assessment>
      ) : (
        ''
      )}
      {activeStep === 4 ||
      (props.user.roles[0] === 'VHT' && activeStep === 3) ||
      (activeStep === 1 &&
        (props.formStatus === FormStatusEnum.EDIT_PATIENT_INFORMATION ||
          props.formStatus === FormStatusEnum.ADD_ASSESSMENT ||
          props.formStatus === FormStatusEnum.UPDATE_ASSESSMENT)) ? (
        <ConfirmationPage
          formStatus={props.formStatus}
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
          <Redirect to={'/patients/' + patient.patientId} />
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
                error={props.error}
                success={props.success}
                patientExist={
                  props.newPatientExist || props.patientFromEdit ? true : false
                }
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
  error: patients.error,
  success: patients.success,
  assessmentFromEdit: router.location.state
    ? (router.location.state as LocationState).assessment ?? null
    : null,
  formStatus: router.location.state
    ? (router.location.state as LocationState).status
    : null,
  patientFromEdit: router.location.state
    ? (router.location.state as LocationState).patient
    : null,
  readingId: router.location.state
    ? (router.location.state as LocationState).readingId
    : null,
  userId: router.location.state
    ? (router.location.state as LocationState).userId
    : null,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  ...bindActionCreators(
    {
      getCurrentUser,
      resetNewReadingStatus,
      addPatientNew,
      addReadingNew,
      createAssessment,
      updateAssessment,
      updatePatient,
      doesPatientExist,
      afterDoesPatientExist,
      afterNewPatientAdded,
      clearCreateAssessmentOutcome,
      clearUpdateAssessmentOutcome,
      clearUpdatePatientOutcome,
    },
    dispatch
  ),
  goBackToPatientPage: (): void => {
    dispatch(goBack());
  },
});
export const NewReading = connect(mapStateToProps, mapDispatchToProps)(Page);
