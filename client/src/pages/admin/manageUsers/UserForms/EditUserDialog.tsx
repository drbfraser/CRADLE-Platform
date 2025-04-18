import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Form, Formik } from 'formik';
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
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { UserRoleEnum } from 'src/shared/enums';
import { editUserAsync } from 'src/shared/api/api';
import { EditUser, User } from 'src/shared/api/validation/user';
import { UserPhoneNumbersFieldArray } from 'src/pages/admin/manageUsers/UserForms/UserPhoneNumbersFieldArray';
import {
  UserEmailField,
  UserHealthFacilityField,
  UserNameField,
  UserRoleField,
} from './UserFormFields';
import { getOtherUsersEmailsAndPhoneNumbers } from './userFormHelpers';
import { UserField, fieldLabels, makeEditUserValidationSchema } from './state';

interface IProps {
  open: boolean;
  onClose: () => void;
  users: User[];
  userToEdit: EditUser;
}

export const EditUserDialog = ({
  open,
  onClose,
  users,
  userToEdit,
}: IProps) => {
  const { otherUsersEmails, otherUsersPhoneNumbers } =
    getOtherUsersEmailsAndPhoneNumbers(users, userToEdit.id);
  const validationSchema = makeEditUserValidationSchema(
    otherUsersEmails,
    otherUsersPhoneNumbers
  );

  const updateUser = useMutation({
    mutationFn: (editedUser: EditUser) =>
      editUserAsync(editedUser, userToEdit.id).catch((e) => {
        let message = 'Something  wrong';
        if (e instanceof AxiosError) {
          const responseBody = e.response?.data;
          message = responseBody.message;
          if ('message' in responseBody) {
            message = responseBody.message;
          }
        } else if (typeof e === 'string') {
          message = e;
        }
        throw new Error(message);
      }),
  });

  const handleSubmit = (user: EditUser) => {
    const editedUser = { ...user };
    /* Remove any blank phone numbers. */
    editedUser.phoneNumbers = editedUser.phoneNumbers.filter((phoneNumber) => {
      return phoneNumber.trim().length > 0;
    });

    updateUser.mutate(editedUser, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <>
      {updateUser.isError && (
        <APIErrorToast
          errorMessage={updateUser.error.message}
          onClose={() => updateUser.reset()}
        />
      )}

      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              ...userToEdit,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}>
            {({
              values,
              touched,
              errors,
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
                                  users.find((user) => user.id === id)?.name ??
                                  'Unknown'
                              )
                              .join(', '),
                        },
                      }}>
                      {users
                        .filter(
                          (user) =>
                            userToEdit.supervises.includes(user.id) ||
                            (user.role === UserRoleEnum.VHT &&
                              user.id !== userToEdit.id)
                        )
                        .map((user) => (
                          <MenuItem key={user.id} value={user.id}>
                            <Checkbox
                              checked={
                                values.supervises &&
                                values.supervises.indexOf(user.id) >= 0
                              }
                            />
                            {user.name} ({user.email})
                          </MenuItem>
                        ))}
                    </TextField>
                  )}
                  <DialogActions>
                    <CancelButton type="button" onClick={onClose}>
                      Cancel
                    </CancelButton>
                    <PrimaryButton
                      type="submit"
                      disabled={updateUser.isPending || !isValid}>
                      Save
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
