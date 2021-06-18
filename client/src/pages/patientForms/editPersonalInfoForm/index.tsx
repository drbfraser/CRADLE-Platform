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

type RouteParams = {
  patientId: string | undefined;
};

export const EditPersonalInfoPage = () => {
  const classes = useStyles();
  const { patientId } = useRouteMatch<RouteParams>().params;
  const history = useHistory();
  const [formInitialState, setFormInitialState] = useState<PatientState>();
  const [submitError, setSubmitError] = useState(false);

  useEffect(() => {
    getPatientState(patientId).then((state) => setFormInitialState(state));
  }, [patientId]);

  const handleEdit = async (
    values: PatientState,
    helpers: FormikHelpers<PatientState>
  ) => {
    handleSubmit(values, false, history, setSubmitError, helpers.setSubmitting);
  };

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
        <Typography variant="h4">Edit Patient</Typography>
      </div>
      <br />
      {formInitialState === undefined ? (
        <LinearProgress />
      ) : (
        <Formik
          initialValues={formInitialState}
          onSubmit={handleEdit}
          validationSchema={personalInfoValidationSchema(false)}>
          {(formikProps: FormikProps<PatientState>) => (
            <Form>
              <PersonalInfoForm formikProps={formikProps} creatingNew={false} />
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
