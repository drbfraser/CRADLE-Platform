import React, { useState } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import { PersonalInfoForm } from './personalInfo';
import { PregnancyInfoForm } from './pregnancyInfo';
import { MedicalInfoForm } from './medicalInfo';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import Stepper from '@material-ui/core/Stepper/Stepper';
import Typography from '@material-ui/core/Typography';
import StepLabel from '@material-ui/core/StepLabel/StepLabel';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Step from '@material-ui/core/Step/Step';
import { PatientState } from './state';
import {
  handleSubmit,
  handlePregnancyInfo,
  handleMedicalRecordInfo,
} from './handlers';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { personalInfoValidationSchema } from './personalInfo/validation';
import { pregnancyInfoValidationSchema } from './pregnancyInfo/validation';
import { useHistory } from 'react-router-dom';
import {
  drugHistoryValidationSchema,
  medicalHistoryValidationSchema,
} from './medicalInfo/validation';
import { goBackWithFallback } from 'src/shared/utils';

interface PatientFormProps {
  editId: string;
  patientId?: string;
  pregnancyId?: string;
  initialState: PatientState;
  creatingNew: boolean;
  creatingNewPregnancy: boolean;
}

export const PatientForm = ({
  editId,
  patientId,
  pregnancyId,
  initialState,
  creatingNew,
  creatingNewPregnancy,
}: PatientFormProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const isBigScreen = useMediaQuery(theme.breakpoints.up('sm'));
  const [submitError, setSubmitError] = useState(false);
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
        ? 'Update/Close Pregnancy'
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
          setSubmitError,
          helpers.setSubmitting
        );
      } else if (
        pages[pageNum].editId === 'drugHistory' ||
        pages[pageNum].editId === 'medicalHistory'
      ) {
        handleMedicalRecordInfo(
          patientId,
          values,
          pages[pageNum].isDrugRecord,
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
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <div className={classes.title}>
        <Tooltip title="Go back" placement="top">
          <IconButton
            onClick={() => goBackWithFallback(`/patients/${patientId ?? ''}`)}>
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
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setPageNum(pageNum - 1)}
                disabled={pageNum === 0 || formikProps.isSubmitting}>
                Back
              </Button>
            )}
            <Button
              variant="contained"
              color="primary"
              className={classes.right}
              type="submit"
              disabled={formikProps.isSubmitting}>
              {editId || creatingNewPregnancy
                ? 'Save'
                : isFinalPage
                ? 'Create'
                : 'Next'}
            </Button>
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
  },
});
