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
import {
  initialValues,
  IPasswordForm,
  PasswordField,
  validationSchema,
} from './state';

interface IProps {
  open: boolean;
  onClose: () => void;
}

const ChangePassword = ({ open, onClose }: IProps) => {
  const [submitError, setSubmitError] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (values: IPasswordForm) => {
    const init = {
      method: 'POST',
      body: JSON.stringify(values),
    };

    try {
      const resp = await apiFetch(BASE_URL + EndpointEnum.CHANGE_PASS, init);

      if (!resp.ok) {
        throw new Error();
      }

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
          message="Password change successful!"
          clearMessage={() => setSubmitSuccess(false)}
        />
      )}
      <Dialog open={open} maxWidth="xs" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {submitError && (
            <>
              <Alert severity="error" onClose={() => setSubmitError(false)}>
                Unable to change your password. Did you enter your current
                password correctly?
              </Alert>
              <br />
              <br />
            </>
          )}
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}>
            {({ isSubmitting, isValid }) => (
              <Form>
                <Field
                  component={TextField}
                  type="password"
                  fullWidth
                  required
                  variant="outlined"
                  label="Current Password"
                  name={PasswordField.currentPass}
                />
                <br />
                <br />
                <Field
                  component={TextField}
                  type="password"
                  fullWidth
                  required
                  variant="outlined"
                  label="New Password"
                  name={PasswordField.newPass}
                />
                <DialogActions>
                  <Button type="button" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    Change
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

export default ChangePassword;
