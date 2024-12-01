import { Autocomplete, TextField as FormikTextField } from 'formik-mui';
import {
  AutocompleteRenderInputParams,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormGroup,
  MenuItem,
  TextField,
} from '@mui/material';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { UserField, fieldLabels } from './state';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { createUserAsync } from 'src/shared/api/api';
import { useHealthFacilities } from 'src/shared/hooks/healthFacilities';
import { useState } from 'react';
import { userRoleLabels } from 'src/shared/constants';
import { NewUser, User } from 'src/shared/api/validation/user';
import { lowerCase } from 'lodash';
import { UserRoleEnum } from 'src/shared/enums';
import { AxiosError } from 'axios';

const newUserTemplate: NewUser = {
  email: '',
  username: '',
  name: '',
  phoneNumber: '',
  phoneNumbers: [] as string[],
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
  const healthFacilities = useHealthFacilities();
  const [submitError, setSubmitError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const emailsInUse = users.map((user) => user.email);
  const usernamesInUse = users.map((user) => user.username);

  const validateEmail = (value?: string) => {
    if (!value) {
      return 'Email is required';
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
      return 'Invalid email address';
    }
    if (emailsInUse.includes(lowerCase(value))) {
      return 'Email already in use';
    }
    return null;
  };

  const validateUsername = (value?: string) => {
    if (!value) {
      return 'Username is required';
    }

    if (usernamesInUse.includes(lowerCase(value))) {
      return 'Username already in use';
    }
    return null;
  };

  const handleSubmit = async (
    newUser: NewUser,
    { setSubmitting }: FormikHelpers<NewUser>
  ) => {
    /* If the phone number entered is not already in the user's array of 
    phone numbers, prepend it to the array. */
    if (
      newUser.phoneNumber &&
      !newUser.phoneNumbers.includes(newUser.phoneNumber)
    ) {
      newUser.phoneNumbers = [newUser.phoneNumber, ...newUser.phoneNumbers];
    }
    try {
      await createUserAsync(newUser);
      onClose();
    } catch (e) {
      let message = '';
      if (e instanceof Response) {
        const responseBody = await e.json();
        if ('message' in responseBody) {
          message = responseBody.message;
        }
      } else if (e instanceof AxiosError) {
        const responseBody = e.response?.data as { message: string };
        message = responseBody.message;
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
          <Formik initialValues={newUserTemplate} onSubmit={handleSubmit}>
            {({ touched, errors, isSubmitting, isValid }) => (
              <Form autoComplete={'off'}>
                <FormGroup
                  sx={{
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}>
                  <Field
                    id={'new-user-field-name'}
                    component={FormikTextField}
                    fullWidth
                    required
                    inputProps={{ maxLength: 25 }}
                    variant="outlined"
                    label={fieldLabels[UserField.name]}
                    name={UserField.name}
                  />
                  <Field
                    id={'new-user-field-username'}
                    component={FormikTextField}
                    fullWidth
                    required
                    inputProps={{ maxLength: 25 }}
                    variant="outlined"
                    label={'Username'}
                    name={'username'}
                    validate={validateUsername}
                    autoComplete={'new-password'}
                  />
                  <Field
                    id={'new-user-field-email'}
                    component={FormikTextField}
                    fullWidth
                    required
                    inputProps={{ maxLength: 120 }}
                    variant="outlined"
                    label={fieldLabels[UserField.email]}
                    name={UserField.email}
                    validate={validateEmail}
                  />
                  <Field
                    id={'new-user-field-phone-number'}
                    component={FormikTextField}
                    fullWidth
                    required
                    inputProps={{ maxLength: 25 }}
                    variant="outlined"
                    label={fieldLabels[UserField.phoneNumber]}
                    name={UserField.phoneNumber}
                  />
                  <Field
                    id={'new-user-field-facility'}
                    component={Autocomplete}
                    fullWidth
                    name={UserField.healthFacilityName}
                    options={healthFacilities}
                    disableClearable={true}
                    renderInput={(params: AutocompleteRenderInputParams) => (
                      <TextField
                        {...params}
                        name={UserField.healthFacilityName}
                        error={
                          touched[UserField.healthFacilityName] &&
                          !!errors[UserField.healthFacilityName]
                        }
                        helperText={
                          touched[UserField.healthFacilityName]
                            ? errors[UserField.healthFacilityName]
                            : ''
                        }
                        label={fieldLabels[UserField.healthFacilityName]}
                        variant="outlined"
                        required
                      />
                    )}
                  />
                  <Field
                    id={'new-user-field-role'}
                    component={FormikTextField}
                    fullWidth
                    select
                    required
                    variant="outlined"
                    label={fieldLabels[UserField.role]}
                    name={UserField.role}>
                    {Object.entries(userRoleLabels).map(([value, name]) => (
                      <MenuItem key={value} value={value}>
                        {name}
                      </MenuItem>
                    ))}
                  </Field>
                  <Field
                    id={'new-user-field-password'}
                    component={FormikTextField}
                    fullWidth
                    required
                    variant="outlined"
                    type="password"
                    label={fieldLabels[UserField.password]}
                    name={UserField.password}
                    autoComplete={'new-password'}
                  />
                  <Field
                    id={'new-user-field-confirm-password'}
                    component={FormikTextField}
                    fullWidth
                    required
                    variant="outlined"
                    type="password"
                    label={fieldLabels[UserField.confirmPassword]}
                    name={UserField.confirmPassword}
                    autoComplete={'new-password'}
                  />

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
