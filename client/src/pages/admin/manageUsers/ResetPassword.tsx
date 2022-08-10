import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import {
  UserField,
  fieldLabels,
  passwordValidationSchema,
  resetPasswordTemplate,
} from './state';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { IUser } from 'src/shared/types';
import { TextField } from 'formik-mui';
import { Toast } from 'src/shared/components/toast';
import { resetUserPasswordAsync } from 'src/shared/api';

interface IProps {
  open: boolean;
  onClose: () => void;
  resetUser: IUser | undefined;
}

const ResetPassword = ({ open, onClose, resetUser }: IProps) => {
  const [submitError, setSubmitError] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (values: { [UserField.password]: string }) => {
    if (!resetUser) {
      return;
    }

    try {
      await resetUserPasswordAsync(resetUser, values[UserField.password]);

      setSubmitError(false);
      setSubmitSuccess(true);
      onClose();
    } catch (e) {
      setSubmitError(true);
    }
  };

  return (
    <>
      <Toast
        severity="success"
        message="Password reset successful!"
        open={submitSuccess}
        onClose={() => setSubmitSuccess(false)}
      />
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <Dialog open={open} maxWidth="xs" fullWidth>
        <DialogTitle>Reset Password: {resetUser?.firstName ?? ''}</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={resetPasswordTemplate}
            validationSchema={passwordValidationSchema}
            onSubmit={handleSubmit}>
            {({ isSubmitting }) => (
              <Form
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  rowGap: '10px',
                }}>
                <Field
                  component={TextField}
                  type="password"
                  fullWidth
                  required
                  variant="outlined"
                  label={fieldLabels[UserField.password]}
                  name={UserField.password}
                />
                <Field
                  component={TextField}
                  type="password"
                  fullWidth
                  required
                  variant="outlined"
                  label={fieldLabels[UserField.confirmPassword]}
                  name={UserField.confirmPassword}
                />
                <DialogActions>
                  <CancelButton type="button" onClick={onClose}>
                    Cancel
                  </CancelButton>
                  <PrimaryButton type="submit" disabled={isSubmitting}>
                    Reset
                  </PrimaryButton>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResetPassword;
