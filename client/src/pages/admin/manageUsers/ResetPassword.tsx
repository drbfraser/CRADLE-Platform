import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React, { useState } from 'react';
import { EndpointEnum } from 'src/server';
import { BASE_URL } from 'src/server/utils';
import { Toast } from 'src/shared/components/toast';
import { apiFetch } from 'src/shared/utils/api';
import { fieldLabels, passwordValidationSchema, UserField } from './state';

interface IProps {
  open: boolean;
  onClose: () => void;
  userId: number;
}

const ResetPassword = ({ open, onClose, userId }: IProps) => {
  const [submitError, setSubmitError] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (values: { [UserField.password]: string }) => {
    const init = {
      method: 'POST',
      body: JSON.stringify({
        id: userId,
        [UserField.password]: values[UserField.password],
      }),
    };

    try {
      const resp = await apiFetch(BASE_URL + EndpointEnum.RESET_PASS, init);

      if (!resp.ok) {
        throw new Error();
      }

      setSubmitError(false);
      setSubmitSuccess(true);
      onClose();
    } catch (e) {
      setSubmitError(true);
    }
  };

  return (
    <>
      {submitSuccess && (
        <Toast
          status="success"
          message="Password reset successful!"
          clearMessage={() => setSubmitSuccess(false)}
        />
      )}
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          {submitError && (
            <>
              <Alert severity="error" onClose={() => setSubmitError(false)}>
                Something went wrong resetting the password. Please try again.
              </Alert>
              <br />
              <br />
            </>
          )}
          <Formik
            initialValues={{} as any}
            validationSchema={passwordValidationSchema}
            onSubmit={handleSubmit}>
            {({ isSubmitting }) => (
              <Form>
                <Field
                  component={TextField}
                  type="password"
                  fullWidth
                  required
                  variant="outlined"
                  label={fieldLabels[UserField.password]}
                  name={UserField.password}
                />
                <br />
                <br />
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
                  <Button type="button" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    Reset
                  </Button>
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
