import { useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { TextField } from 'formik-mui';
import { Field, Form, Formik } from 'formik';

import { resetUserPasswordAsync } from 'src/shared/api/api';
import { User } from 'src/shared/api/validation/user';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { Toast } from 'src/shared/components/toast';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import {
  UserField,
  fieldLabels,
  passwordValidationSchema,
  resetPasswordTemplate,
} from './UserForms/state';

type FormValues = typeof resetPasswordTemplate;

interface IProps {
  open: boolean;
  onClose: () => void;
  resetUser: User;
}

const ResetPasswordDialog = ({ open, onClose, resetUser }: IProps) => {
  const updatePassword = useMutation({
    mutationFn: ({
      resetUser,
      newPassword,
    }: {
      resetUser: User;
      newPassword: string;
    }) => resetUserPasswordAsync(resetUser, newPassword),
  });

  const handleSubmit = async (values: FormValues) => {
    updatePassword.mutate(
      { resetUser, newPassword: values[UserField.password] },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <>
      <Toast
        severity="success"
        message="Password reset successful!"
        open={updatePassword.isSuccess}
      />
      {updatePassword.isError && !updatePassword.isPending && <APIErrorToast />}

      <Dialog open={open} maxWidth="xs" fullWidth>
        <DialogTitle>Reset Password: {resetUser.name}</DialogTitle>
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

export default ResetPasswordDialog;
