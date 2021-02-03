import { makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { Field, Form, Formik } from 'formik';
import { CheckboxWithLabel, TextField } from 'formik-material-ui';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Toast } from '../../../src/shared/components/toast';
import { handleSubmit } from './handlers';
import { AssessmentField, AssessmentState } from './state';

interface IProps {
  initialState: AssessmentState;
  patientId: string;
  assessmentId: string | undefined;
}

export const AssessmentForm = ({ initialState, patientId, assessmentId }: IProps) => {
  const classes = useStyles();
  const history = useHistory();
  const [submitError, setSubmitError] = useState(false);
  
  return (
    <>
      {submitError && (
        <Toast
          status="error"
          message="Something went wrong on our end. Please try that again."
          clearMessage={() => setSubmitError(false)}
        />
      )}
      <Formik
        initialValues={initialState}
        onSubmit={handleSubmit(patientId, assessmentId, history, setSubmitError)}
      >
        {({
          values,
          isSubmitting,
        }) => (
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
                        name={AssessmentField.medication}
                        label="Medication Prescribed (include dose and frequency)"
                      />
                    </Grid>
                    <Grid item sm={12} md={4}>
                      <Field
                        component={CheckboxWithLabel}
                        type="checkbox"
                        name={AssessmentField.followUp}
                        Label={{ label: 'Follow-up Needed' }}
                      />
                    </Grid>
                    <Grid item sm={12} md={8}>
                      <Field
                        component={TextField}
                        variant="outlined"
                        fullWidth
                        name={AssessmentField.followUpInstruc}
                        label="Instructions for Follow-up"
                        disabled={!values[AssessmentField.followUp]}
                      />
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
