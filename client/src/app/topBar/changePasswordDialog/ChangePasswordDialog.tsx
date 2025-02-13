import { useMutation } from '@tanstack/react-query';
import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { TextField } from 'formik-mui';
import { Field, Form, Formik } from 'formik';

import { changePasswordAsync } from 'src/shared/api/api';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import { Toast } from 'src/shared/components/toast';
import {
  IPasswordForm,
  PasswordField,
  initialValues,
  validationSchema,
} from './state';

interface IProps {
  open: boolean;
  onClose: () => void;
}

const ChangePasswordDialog = ({ open, onClose }: IProps) => {
  const changePassword = useMutation({
    mutationFn: (values: IPasswordForm) =>
      changePasswordAsync(
        values[PasswordField.currentPass],
        values[PasswordField.newPass]
      ),
  });

  const handleSubmit = async (values: IPasswordForm) => {
    changePassword.mutate(values, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <>
      <Toast
        severity="success"
        message="Password change successful!"
        open={changePassword.isSuccess}
      />

      <Dialog open={open} maxWidth="xs" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {changePassword.isError && (
            <Alert sx={{ marginBottom: '2rem' }} severity="error">
              Unable to change your password. Did you enter your current
              password correctly?
            </Alert>
          )}
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}>
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
                label="Current Password"
                name={PasswordField.currentPass}
              />
              <Field
                component={TextField}
                type="password"
                fullWidth
                required
                variant="outlined"
                label="New Password"
                name={PasswordField.newPass}
              />
              <Field
                component={TextField}
                type="password"
                fullWidth
                required
                variant="outlined"
                label="Confirm New Password"
                name={PasswordField.confirmNewPass}
              />
              <DialogActions>
                <CancelButton type="button" onClick={onClose}>
                  Cancel
                </CancelButton>
                <PrimaryButton
                  type="submit"
                  disabled={changePassword.isPending}>
                  Change
                </PrimaryButton>
              </DialogActions>
            </Form>
          </Formik>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChangePasswordDialog;
