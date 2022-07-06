import { makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { TextField as FormikTextField } from 'formik-material-ui';
import { Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { handleSubmit } from './handlers';
import { initialState, SingleReasonField } from './state';
import { PrimaryButton } from 'src/shared/components/Button';

interface IProps {
  referralId: string;
  type: string;
}

//currently, this form only supports three types of form
//1.from referral-did-not-attend-card
//2.from referral-cancel-card
//3.from referral-undo-cancel-card
export const SingleReasonForm = ({ referralId, type }: IProps) => {
  const classes = useStyles();
  const [submitError, setSubmitError] = useState(false);

  return (
    <>
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <Formik
        initialValues={initialState}
        onSubmit={handleSubmit(referralId, type, setSubmitError)}>
        {({ touched, errors, isSubmitting }) => (
          <Form>
            <Paper>
              <Box p={2}>
                <Box pt={1} pl={3} pr={3}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Field
                        component={FormikTextField}
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={4}
                        name={SingleReasonField.comment}
                        label="Comments"
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Paper>
            <br />
            <PrimaryButton
              className={classes.right}
              type="submit"
              disabled={isSubmitting}>
              Submit
            </PrimaryButton>
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
