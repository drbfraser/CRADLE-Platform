import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Field, Form, Formik } from 'formik';
import { TextField as FormikTextField } from 'formik-mui';
import { Grid, Paper } from '@mui/material';

import {
  setReferralCancelStatusAsync,
  setReferralNotAttendedAsync,
} from 'src/shared/api';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { PrimaryButton } from 'src/shared/components/Button';
import { SingleReason, SingleReasonField, initialState } from './state';

interface IProps {
  referralId: string;
  cancellationType: string;
}

// currently, this form only supports three types of form
//   1.from referral-did-not-attend-card
//   2.from referral-cancel-card
//   3.from referral-undo-cancel-card
export const SingleReasonForm = ({ referralId, cancellationType }: IProps) => {
  const navigate = useNavigate();

  const updateReferralCancelStatus = useMutation({
    mutationFn: (values: {
      referralId: string;
      comment: string;
      cancellationType: string;
    }) => {
      return setReferralCancelStatusAsync(
        values.referralId,
        values.comment,
        cancellationType === 'cancel_referral'
      );
    },
  });
  const updateReferralAttendedStatus = useMutation({
    mutationFn: (values: { referralId: string; comment: string }) => {
      return setReferralNotAttendedAsync(values.referralId, values.comment);
    },
  });

  const handleSubmit = async ({ comment }: SingleReason) => {
    try {
      if (
        cancellationType === 'cancel_referral' ||
        cancellationType === 'undo_cancel_referral'
      ) {
        await updateReferralCancelStatus.mutateAsync({
          referralId,
          comment,
          cancellationType,
        });
      } else if (cancellationType === 'not_attend_referral') {
        await updateReferralAttendedStatus.mutateAsync({
          referralId,
          comment,
        });
      } else {
        throw new Error(`unknown cancellation type: ${cancellationType}`);
      }

      navigate('/patients');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {updateReferralCancelStatus.isError && (
        <APIErrorToast onClose={() => updateReferralCancelStatus.reset()} />
      )}
      {updateReferralAttendedStatus.isError && (
        <APIErrorToast onClose={() => updateReferralAttendedStatus.reset()} />
      )}

      <Formik initialValues={initialState} onSubmit={handleSubmit}>
        <Form>
          <Paper sx={{ padding: 4 }}>
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
          </Paper>

          <PrimaryButton
            sx={{
              marginTop: '1rem',
              right: {
                float: 'right',
              },
            }}
            type="submit"
            disabled={
              updateReferralCancelStatus.isPending ||
              updateReferralAttendedStatus.isPending
            }>
            Submit
          </PrimaryButton>
        </Form>
      </Formik>
    </>
  );
};
