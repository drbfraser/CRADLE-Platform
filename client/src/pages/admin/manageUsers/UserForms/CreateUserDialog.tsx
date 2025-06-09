import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Form, Formik } from 'formik';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormGroup,
} from '@mui/material';

import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { createUserAsync } from 'src/shared/api';
import { NewUser, User } from 'src/shared/api/validation/user';
import { UserRoleEnum } from 'src/shared/enums';
import { UserPhoneNumbersFieldArray } from 'src/pages/admin/manageUsers/UserForms/UserPhoneNumbersFieldArray';
import {
  UserEmailField,
  UserHealthFacilityField,
  UserNameField,
  UserPasswordField,
  UserRoleField,
  UserUsernameField,
} from './UserFormFields';
import { getOtherUsersEmailsAndPhoneNumbers } from './userFormHelpers';
import { makeNewUserValidationSchema } from './state';

const newUserTemplate: NewUser = {
  email: '',
  username: '',
  name: '',
  phoneNumbers: [''],
  healthFacilityName: '',
  role: UserRoleEnum.VHT,
  supervises: [] as number[],
};

interface IProps {
  open: boolean;
  onClose: () => void;
  users: User[];
}

export const CreateUserDialog = ({ open, onClose, users }: IProps) => {
  const createUser = useMutation({
    mutationFn: (newUser: NewUser) =>
      createUserAsync(newUser).catch((e) => {
        let message = 'Something went wrong';
        if (e instanceof AxiosError) {
          const responseBody = e.response?.data;
          message = responseBody.description;
          if ('message' in responseBody) {
            message = responseBody.description;
          }
        } else if (typeof e == 'string') {
          message = e;
        }
        throw new Error(message);
      }),
  });

  const handleSubmit = (user: NewUser) => {
    const newUser = { ...user };
    /* Remove any blank phone numbers. */
    newUser.phoneNumbers = newUser.phoneNumbers.filter((phoneNumber) => {
      return phoneNumber.trim().length > 0;
    });

    createUser.mutate(newUser, {
      onSuccess: () => onClose(),
    });
  };

  const { otherUsersEmails, otherUsersPhoneNumbers } =
    getOtherUsersEmailsAndPhoneNumbers(users, -1);
  const validationSchema = makeNewUserValidationSchema(
    otherUsersEmails,
    otherUsersPhoneNumbers
  );

  return (
    <>
      {createUser.isError && !createUser.isPending && (
        <APIErrorToast errorMessage={createUser.error.message} />
      )}

      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={newUserTemplate}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}>
            {({ isValid }) => (
              <Form autoComplete="off">
                <FormGroup
                  sx={{
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}>
                  <UserNameField />
                  <UserUsernameField
                    usernamesInUse={users.map((user) => user.username)}
                  />
                  <UserEmailField />
                  <UserPhoneNumbersFieldArray />
                  <UserHealthFacilityField />
                  <UserRoleField />
                  <UserPasswordField />

                  <DialogActions>
                    <CancelButton type="button" onClick={onClose}>
                      Cancel
                    </CancelButton>
                    <PrimaryButton
                      type="submit"
                      disabled={createUser.isPending || !isValid}>
                      Create
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
