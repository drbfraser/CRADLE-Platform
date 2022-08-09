import { Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import { SingleReason, SingleReasonField, initialState } from './state';
import {
  setReferralCancelStatusAsync,
  setReferralNotAttendedAsync,
} from 'src/shared/api';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import Box from '@mui/material/Box';
import { TextField as FormikTextField } from 'formik-material-ui';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { PrimaryButton } from 'src/shared/components/Button';
import { goBackWithFallback } from 'src/shared/utils';
import makeStyles from '@mui/styles/makeStyles';

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

  const handleSubmit = async (values: SingleReason, { setSubmitting }: any) => {
    try {
      if (type === 'cancel_referral' || type === 'undo_cancel_referral') {
        setReferralCancelStatusAsync(
          referralId,
          values.comment,
          type === 'cancel_referral'
        );
      } else if (type === 'not_attend_referral') {
        setReferralNotAttendedAsync(referralId, values.comment);
      }

      goBackWithFallback('/patients');
    } catch (e) {
      console.error(e);
      setSubmitError(true);
      setSubmitting(false);
    }
  };

  return (
    <>
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <Formik initialValues={initialState} onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
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
