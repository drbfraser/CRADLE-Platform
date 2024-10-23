import { Field, Form, Formik } from 'formik';
import { SingleReason, SingleReasonField, initialState } from './state';
import {
  setReferralCancelStatusAsync,
  setReferralNotAttendedAsync,
} from 'src/shared/api';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import Box from '@mui/material/Box';
import { TextField as FormikTextField } from 'formik-mui';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { PrimaryButton } from 'src/shared/components/Button';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface IProps {
  referralId?: string;
  cancellationType?: string;
}

//currently, this form only supports three types of form
//1.from referral-did-not-attend-card
//2.from referral-cancel-card
//3.from referral-undo-cancel-card
export const SingleReasonForm = ({ referralId, cancellationType }: IProps) => {
  const [submitError, setSubmitError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!referralId || !cancellationType) {
      console.error('ERROR: invalid path.');
      navigate('/referrals', { replace: true });
    }
  }, [referralId, cancellationType]);

  const handleSubmit = async (values: SingleReason, { setSubmitting }: any) => {
    if (!referralId) {
      console.error('ERROR: invalid referral Id.');
      setSubmitError(true);
      setSubmitting(false);
      return;
    }
    try {
      if (
        cancellationType === 'cancel_referral' ||
        cancellationType === 'undo_cancel_referral'
      ) {
        setReferralCancelStatusAsync(
          referralId,
          values.comment,
          cancellationType === 'cancel_referral'
        );
      } else if (cancellationType === 'not_attend_referral') {
        setReferralNotAttendedAsync(referralId, values.comment);
      }

      navigate('/patients');
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
              sx={{
                right: {
                  float: 'right',
                },
              }}
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
