import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormGroup,
  MenuItem,
  TextField,
} from '@mui/material';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import { Form, Formik, FormikHelpers } from 'formik';
import { UserField, fieldLabels, makeEditUserValidationSchema } from './state';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { UserRoleEnum } from 'src/shared/enums';
import { editUserAsync } from 'src/shared/api/api';
import { useState } from 'react';
import { EditUser, User } from 'src/shared/api/validation/user';
import { AxiosError } from 'axios';
import { UserPhoneNumbersFieldArray } from 'src/pages/admin/manageUsers/UserForms/UserPhoneNumbersFieldArray';
import {
  UserEmailField,
  UserHealthFacilityField,
  UserNameField,
  UserRoleField,
} from './UserFormFields';
import { getOtherUsersEmailsAndPhoneNumbers } from './userFormHelpers';

interface IProps {
  open: boolean;
  onClose: () => void;
  users: User[];
  editUser: EditUser;
}

export const EditUserDialog = ({ open, onClose, users, editUser }: IProps) => {
  const [submitError, setSubmitError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { otherUsersEmails, otherUsersPhoneNumbers } =
    getOtherUsersEmailsAndPhoneNumbers(users, editUser.id);
  const validationSchema = makeEditUserValidationSchema(
    otherUsersEmails,
    otherUsersPhoneNumbers
  );

  const handleSubmit = async (
    user: EditUser,
    { setSubmitting }: FormikHelpers<EditUser>
  ) => {
    const editedUser = { ...user };
    /* Remove any blank phone numbers. */
    editedUser.phoneNumbers = editedUser.phoneNumbers.filter((phoneNumber) => {
      return phoneNumber.trim().length > 0;
    });

    try {
      await editUserAsync(editedUser, editUser.id);
      onClose();
    } catch (e) {
      let message = 'Something went wrong';
      if (e instanceof AxiosError) {
        const responseBody = e.response?.data;
        message = responseBody.message;
        if ('message' in responseBody) {
          message = responseBody.message;
        }
      } else if (typeof e == 'string') {
        console.log('e is a string');
        message = e;
      }
      setSubmitting(false);
      setErrorMessage(`Error: ${message}`);
      setSubmitError(true);
    }
  };

  return (
    <>
      <APIErrorToast
        open={submitError}
        onClose={() => {
          setSubmitError(false);
          setErrorMessage('');
        }}
        errorMessage={errorMessage}
      />
      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogTitle>{'Edit'} User</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              ...editUser,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}>
            {({
              values,
              touched,
              errors,
              isSubmitting,
              isValid,
              handleChange,
              handleBlur,
            }) => (
              <Form>
                <FormGroup
                  sx={{
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}>
                  <UserNameField />
                  <UserEmailField />
                  <UserPhoneNumbersFieldArray />
                  <UserHealthFacilityField />
                  <UserRoleField />
                  {values.role === UserRoleEnum.CHO && (
                    <>
                      <TextField
                        label={fieldLabels[UserField.supervises]}
                        name={UserField.supervises}
                        value={values.supervises}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.supervises && !!errors.supervises}
                        helperText={touched.supervises && errors.supervises}
                        variant="outlined"
                        fullWidth
                        select
                        slotProps={{
                          select: {
                            multiple: true,
                            renderValue: (ids: unknown) =>
                              (ids as number[])
                                .map(
                                  (id) =>
                                    users.find((u) => u.id === id)?.name ??
                                    'Unknown'
                                )
                                .join(', '),
                          },
                        }}>
                        {users
                          .filter(
                            (user) =>
                              editUser.supervises.includes(user.id) ||
                              (user.role === UserRoleEnum.VHT &&
                                user.id !== editUser.id)
                          )
                          .map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                              <Checkbox
                                checked={
                                  values.supervises &&
                                  values.supervises?.indexOf(user.id) >= 0
                                }
                              />
                              {user.name} ({user.email})
                            </MenuItem>
                          ))}
                      </TextField>
                    </>
                  )}
                  <DialogActions>
                    <CancelButton type="button" onClick={onClose}>
                      Cancel
                    </CancelButton>
                    <PrimaryButton
                      type="submit"
                      disabled={isSubmitting || !isValid}>
                      {'Save'}
                    </PrimaryButton>
                  </DialogActions>
                </FormGroup>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </>
  );
};
