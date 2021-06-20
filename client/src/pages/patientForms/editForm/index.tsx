import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { PersonalInfoForm } from '../personalInfoForm';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { getPatientState, PatientState } from '../state';
import LinearProgress from '@material-ui/core/LinearProgress';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Typography from '@material-ui/core/Typography';
import { Button } from '@material-ui/core';
import { Form, Formik, FormikProps, FormikHelpers } from 'formik';
import { goBackWithFallback } from 'src/shared/utils';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { handleSubmit } from '../handlers';
import { personalInfoValidationSchema } from '../personalInfoForm/validation';
import {
  drugHistoryValidationSchema,
  medicalHistoryValidationSchema,
} from '../medicalForm/validation';
import { MedicalInfoForm } from '../medicalForm';
import { NotFoundPage } from 'src/pages/notFound';

type Page = {
  name: string;
  component: any;
  validationSchema: any;
  isDrugRecord?: boolean;
};

type RouteParams = {
  patientId: string | undefined;
  editId: string;
};

const pages: { [key: string]: Page } = {
  personalInfo: {
    name: 'Personal Information',
    component: PersonalInfoForm,
    validationSchema: personalInfoValidationSchema(false),
  },
  drugHistory: {
    name: 'Drug History',
    component: MedicalInfoForm,
    validationSchema: drugHistoryValidationSchema,
    isDrugRecord: true,
  },
  medicalHistory: {
    name: 'Medical History',
    component: MedicalInfoForm,
    validationSchema: medicalHistoryValidationSchema,
    isDrugRecord: false,
  },
};

export const EditPatientPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const { patientId, editId } = useRouteMatch<RouteParams>().params;
  const [submitError, setSubmitError] = useState(false);
  const [formInitialState, setFormInitialState] = useState<PatientState>();

  useEffect(() => {
    getPatientState(patientId).then((state) => setFormInitialState(state));
  }, [patientId]);

  if (!Object.prototype.hasOwnProperty.call(pages, editId)) {
    return <NotFoundPage />;
  }

  const handleEdit = async (
    values: PatientState,
    helpers: FormikHelpers<PatientState>
  ) => {
    handleSubmit(values, false, history, setSubmitError, helpers.setSubmitting);
  };

  const PageComponent = pages[editId].component;

  return (
    <div className={classes.container}>
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <div className={classes.title}>
        <Tooltip title="Go back" placement="top">
          <IconButton
            onClick={() => goBackWithFallback(`/patients/${patientId ?? ''}`)}>
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Typography variant="h4">Edit {pages[editId].name}</Typography>
      </div>
      <br />
      {formInitialState === undefined ? (
        <LinearProgress />
      ) : (
        <Formik
          initialValues={formInitialState}
          onSubmit={handleEdit}
          validationSchema={pages[editId].validationSchema}>
          {(formikProps: FormikProps<PatientState>) => (
            <Form>
              <PageComponent
                formikProps={formikProps}
                creatingNew={false}
                isDrugRecord={pages[editId].isDrugRecord}
              />
              <br />
              <Button
                variant="contained"
                color="primary"
                className={classes.right}
                type="submit"
                disabled={formikProps.isSubmitting}>
                Save Changes
              </Button>
            </Form>
          )}
        </Formik>
      )}
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
