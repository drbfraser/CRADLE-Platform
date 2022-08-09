import {
  CancelButton,
  PrimaryButton,
  SecondaryButton,
} from 'src/shared/components/Button';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import React, { useState } from 'react';
import {
  drugHistoryValidationSchema,
  medicalHistoryValidationSchema,
} from './medicalInfo/validation';
import {
  handleDeleteRecord,
  handleMedicalRecordInfo,
  handlePregnancyInfo,
  handleSubmit,
} from './handlers';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { ConfirmDialog } from 'src/shared/components/confirmDialog/index';
import IconButton from '@mui/material/IconButton';
import { MedicalInfoForm } from './medicalInfo';
import { PatientState } from './state';
import { PersonalInfoForm } from './personalInfo';
import { PregnancyInfoForm } from './pregnancyInfo';
import Step from '@mui/material/Step/Step';
import StepLabel from '@mui/material/StepLabel/StepLabel';
import Stepper from '@mui/material/Stepper/Stepper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { goBackWithFallback } from 'src/shared/utils';
import makeStyles from '@mui/styles/makeStyles';
import { personalInfoValidationSchema } from './personalInfo/validation';
import { pregnancyInfoValidationSchema } from './pregnancyInfo/validation';
import { useHistory } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

interface PatientFormProps {
  editId: string;
  patientId?: string;
  pregnancyId?: string;
  universalRecordId?: string;
  initialState: PatientState;
  creatingNew: boolean;
  creatingNewPregnancy: boolean;
}

export const PatientForm = ({
  editId,
  patientId,
  pregnancyId,
  universalRecordId,
  initialState,
  creatingNew,
  creatingNewPregnancy,
}: PatientFormProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const isBigScreen = useMediaQuery(theme.breakpoints.up('sm'));
  const [submitError, setSubmitError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const pages = [
    {
      editId: 'personalInfo',
      name: 'Patient Personal Information',
      component: PersonalInfoForm,
      validationSchema: personalInfoValidationSchema(
        creatingNew ? true : false
      ),
      title: creatingNew ? 'New Patient' : 'Edit Personal Information',
    },
    {
      editId: 'pregnancyInfo',
      name: 'Pregnancy Information',
      component: PregnancyInfoForm,
      validationSchema: pregnancyInfoValidationSchema,
      title: creatingNewPregnancy
        ? 'Add New Pregnancy'
        : editId
        ? 'Edit/Close Pregnancy'
        : 'New Patient',
    },
    {
      editId: editId === 'drugHistory' ? 'drugHistory' : 'medicalHistory',
      name: 'Medical Information',
      component: MedicalInfoForm,
      validationSchema: editId
        ? editId === 'drugHistory'
          ? drugHistoryValidationSchema
          : medicalHistoryValidationSchema
        : undefined,
      isDrugRecord: editId
        ? editId === 'drugHistory'
          ? true
          : false
        : undefined,
      title: editId
        ? editId === 'drugHistory'
          ? 'Add/Update Drug History'
          : 'Add/Update Medical History'
        : 'New Patient',
    },
  ];

  const initPageNum = editId
    ? pages.findIndex((page) => {
        return page.editId === editId;
      })
    : creatingNewPregnancy
    ? 1
    : 0;
  const [pageNum, setPageNum] = useState(initPageNum);
  const PageComponent = pages[pageNum].component;
  const isFinalPage = pageNum === pages.length - 1;

  const handleNext = async (
    values: PatientState,
    helpers: FormikHelpers<PatientState>
  ) => {
    if (editId || creatingNewPregnancy) {
      if (pages[pageNum].editId === 'pregnancyInfo') {
        handlePregnancyInfo(
          patientId,
          pregnancyId,
          creatingNewPregnancy,
          values,
          history,
          setSubmitError,
          helpers.setSubmitting,
          setErrorMessage
        );
      } else if (
        pages[pageNum].editId === 'drugHistory' ||
        pages[pageNum].editId === 'medicalHistory'
      ) {
        handleMedicalRecordInfo(
          patientId,
          values,
          pages[pageNum].isDrugRecord,
          history,
          setSubmitError,
          helpers.setSubmitting
        );
      } else {
        handleSubmit(
          values,
          false,
          history,
          setSubmitError,
          helpers.setSubmitting
        );
      }
    } else if (isFinalPage) {
      handleSubmit(
        values,
        true,
        history,
        setSubmitError,
        helpers.setSubmitting
      );
    } else {
      helpers.setTouched({});
      helpers.setSubmitting(false);
      setPageNum(pageNum + 1);
    }
  };

  return (
    <>
      <APIErrorToast
        open={submitError}
        onClose={() => setSubmitError(false)}
        errorMessage={errorMessage}
      />
      <div className={classes.title}>
        <Tooltip title="Go back" placement="top">
          <IconButton
            onClick={() => goBackWithFallback(`/patients/${patientId ?? ''}`)}
            size="large">
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Typography variant="h4">{pages[pageNum].title}</Typography>
      </div>
      {creatingNew && !creatingNewPregnancy && (
        <Stepper
          activeStep={pageNum}
          orientation={isBigScreen ? 'horizontal' : 'vertical'}>
          {pages.map((page, idx) => (
            <Step key={idx}>
              <StepLabel>{page.name}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}
      <br />
      <Formik
        initialValues={initialState}
        onSubmit={handleNext}
        validationSchema={pages[pageNum].validationSchema}>
        {(formikProps: FormikProps<PatientState>) => (
          <Form>
            <PageComponent
              formikProps={formikProps}
              creatingNew={creatingNew}
              isDrugRecord={pages[pageNum].isDrugRecord}
              creatingNewPregnancy={creatingNewPregnancy}
            />
            <br />
            {creatingNew && (
              <SecondaryButton
                onClick={() => setPageNum(pageNum - 1)}
                disabled={pageNum === 0 || formikProps.isSubmitting}>
                Back
              </SecondaryButton>
            )}
            {editId && universalRecordId && (
              <>
                <CancelButton onClick={() => setIsDialogOpen(true)}>
                  Delete
                </CancelButton>
                <ConfirmDialog
                  title="Delete Record?"
                  content="Are you sure you want to delete this record?"
                  open={isDialogOpen}
                  onClose={() => {
                    setIsDialogOpen(false);
                  }}
                  onConfirm={() =>
                    handleDeleteRecord(
                      editId,
                      universalRecordId,
                      history,
                      setSubmitError,
                      formikProps.setSubmitting
                    ).then(() => setIsDialogOpen(false))
                  }
                />
              </>
            )}
            <PrimaryButton
              className={classes.right}
              type="submit"
              disabled={formikProps.isSubmitting}>
              {editId || creatingNewPregnancy
                ? 'Save'
                : isFinalPage
                ? 'Create'
                : 'Next'}
            </PrimaryButton>
          </Form>
        )}
      </Formik>
    </>
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
    margin: 5,
  },
});
