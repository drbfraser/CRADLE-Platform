import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormGroup,
} from '@mui/material';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import { Form, Formik, FormikHelpers } from 'formik';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { createUserAsync } from 'src/shared/api/api';
import { useState } from 'react';
import { NewUser, User } from 'src/shared/api/validation/user';
import { UserRoleEnum } from 'src/shared/enums';
import { AxiosError } from 'axios';
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
  const [submitError, setSubmitError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { otherUsersEmails, otherUsersPhoneNumbers } =
    getOtherUsersEmailsAndPhoneNumbers(users, -1);

  const validationSchema = makeNewUserValidationSchema(
    otherUsersEmails,
    otherUsersPhoneNumbers
  );

  const usernamesInUse = users.map((user) => user.username);

  const handleSubmit = async (
    user: NewUser,
    { setSubmitting }: FormikHelpers<NewUser>
  ) => {
    const newUser = { ...user };
    /* Remove any blank phone numbers. */
    newUser.phoneNumbers = newUser.phoneNumbers.filter((phoneNumber) => {
      return phoneNumber.trim().length > 0;
    });

    try {
      await createUserAsync(newUser);
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
      <Dialog open={open} maxWidth={'sm'} fullWidth>
        <DialogTitle>{'Create New User'}</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={newUserTemplate}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}>
            {({ isSubmitting, isValid }) => (
              <Form autoComplete={'off'}>
                <FormGroup
                  sx={{
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}>
                  <UserNameField />
                  <UserUsernameField usernamesInUse={usernamesInUse} />
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
                      disabled={isSubmitting || !isValid}>
                      {'Create'}
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
