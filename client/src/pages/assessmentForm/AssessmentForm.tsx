import { makeStyles, Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import WarningIcon from '@material-ui/icons/Warning';
import Paper from '@material-ui/core/Paper';
import { Field, Form, Formik } from 'formik';
import { CheckboxWithLabel, TextField } from 'formik-material-ui';
import React, { useState } from 'react';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { handleSubmit } from './handlers';
import { AssessmentField, AssessmentState } from './state';
// import { API_URL, apiFetch } from '../../shared/api';
// import { EndpointEnum } from '../../shared/enums';
import { assessmentFormValidationSchema } from './validation';

interface IProps {
  initialState: AssessmentState;
  patientId: string;
  assessmentId: string | undefined;
  referralId: string | undefined;
}

export const AssessmentForm = ({
  initialState,
  patientId,
  assessmentId,
  referralId,
}: IProps) => {
  const classes = useStyles();
  const [submitError, setSubmitError] = useState(false);
  // const [displayWarning, setDisplayWarning] = useState(false);
  const [validationError, setValidationError] = useState(false);
  const drugHistory = initialState.drugHistory;

  // useEffect(() => {
  //   // Check if the patient has a pending referral already, warn the user if so
  //   apiFetch(
  //     API_URL + EndpointEnum.PATIENTS + '/' + patientId + EndpointEnum.REFERRALS
  //   )
  //     .then((resp) => resp.json())
  //     .then((data) => {
  //       for (let i = 0; i < data.length; i++) {
  //         if (
  //           !data[i].isAssessed &&
  //           !data[i].isCancelled &&
  //           !data[i].notAttended
  //         ) {
  //           setDisplayWarning(true);
  //         }
  //       }
  //     })
  //     .catch(() => {
  //       console.error('Error receiving referrals');
  //     });
  // });

  return (
    <>
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      {validationError && (
        <Grid item xs={12} md={12}>
          <Paper>
            <Box pl={2} pt={2}>
              <h2>
                {' '}
                <WarningIcon /> Warning
              </h2>
            </Box>
            <Box p={2}>
              <Typography>
                <b>This patient has at least one pending referral.</b> Creating
                this assessment will not mark any pending referrals as assessed.
                If you would like to mark a referral as assessed, return to the
                previous page and then select <b>Assess Referral</b> on the
                pending referral card. If the patient did not attend any pending
                referral(s), please select <b>Did Not Attend</b> on the pending
                referral card(s).
              </Typography>
            </Box>
          </Paper>
          <br />
        </Grid>
      )}
      <Formik
        initialValues={initialState}
        onSubmit={handleSubmit(
          patientId,
          assessmentId,
          referralId,
          drugHistory,
          setSubmitError
        )}
        validationSchema={assessmentFormValidationSchema}>
        {({ values, isSubmitting, errors, touched }) => (
          <Form>
            <Paper>
              <Box p={2}>
                <h2>Assessment</h2>
                <Box pt={1} pl={3} pr={3}>
                  <Grid container spacing={3}>
                    <Grid item sm={12} md={6}>
                      <Field
                        component={TextField}
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={2}
                        name={AssessmentField.investigation}
                        label="Investigation Results (if available)"
                      />
                    </Grid>
                    <Grid item sm={12} md={6}>
                      <Field
                        component={TextField}
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={2}
                        name={AssessmentField.finalDiagnosis}
                        label="Final Diagnosis"
                      />
                    </Grid>
                    <Grid item sm={12} md={6}>
                      <Field
                        component={TextField}
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={2}
                        name={AssessmentField.treatment}
                        label="Treatment / Operation"
                      />
                    </Grid>
                    <Grid item sm={12} md={6}>
                      <Field
                        component={TextField}
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={2}
                        name={AssessmentField.drugHistory}
                        label="Drug history (add new drugs /edit existing drugs; include dose and frequency)"
                      />
                    </Grid>
                    <Grid item sm={12} md={4}>
                      <Field
                        component={CheckboxWithLabel}
                        type="checkbox"
                        name={AssessmentField.followUp}
                        Label={{ label: 'VHT Follow-up in Discharging' }}
                      />
                    </Grid>
                    <Grid item sm={12} md={8}>
                      <Field
                        component={TextField}
                        variant="outlined"
                        fullWidth
                        multiline
                        name={AssessmentField.followUpInstruc}
                        label="Instructions for Follow-up"
                        required={values[AssessmentField.followUp]}
                        disabled={!values[AssessmentField.followUp]}
                      />
                    </Grid>
                    <Grid item sm={12} md={8}>
                      <Typography variant="caption">
                        Editing the Medication Prescribed updates the
                        patient&apos;s Drug History. <br />
                        Consider updating the patient&apos;s Medical History on
                        the Patient Summary screen to mention any updated
                        medical conditions.
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Paper>
            <br />
            <Button
              className={classes.right}
              color="primary"
              variant="contained"
              size="large"
              type="submit"
              disabled={isSubmitting}>
              {assessmentId === undefined ? 'Create' : 'Save Changes'}
            </Button>
          </Form>
        )}
      </Formik>
    </>
  );
};

const useStyles = makeStyles({
  right: {
    float: 'right',
  },
});
