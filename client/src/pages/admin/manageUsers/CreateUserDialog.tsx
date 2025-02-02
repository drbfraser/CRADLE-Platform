import {
  Autocomplete,
  TextField as FormikTextField,
  Select as FormikSelect,
} from 'formik-mui';
import {
  AutocompleteRenderInputParams,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormGroup,
  MenuItem,
  TextField,
  Button,
  IconButton,
  Stack,
} from '@mui/material';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import { Field, FieldArray, Form, Formik, FormikHelpers } from 'formik';
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
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { UserPhoneNumbersFieldArray } from 'src/shared/components/Form/UserForm/UserPhoneNumbersFieldArray';

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
                    inputProps={{
                      maxLength: 25,
                    }}
                    variant="outlined"
                    label={fieldLabels[UserField.name]}
                    name={UserField.name}
                    error={touched.name && !!errors.name}
                  />
                  <Field
                    id={'new-user-field-username'}
                    component={FormikTextField}
                    fullWidth
                    required
                    variant="outlined"
                    label={'Username'}
                    name={'username'}
                    validate={validateUsername}
                    autoComplete={'new-password'}
                    inputProps={{
                      maxLength: 25,
                    }}
                    error={touched.username && !!errors.username}
                  />
                  <Field
                    id={'new-user-field-email'}
                    component={FormikTextField}
                    fullWidth
                    required
                    variant="outlined"
                    label={fieldLabels[UserField.email]}
                    name={UserField.email}
                    validate={validateEmail}
                    inputProps={{
                      maxLength: 120,
                    }}
                    error={touched.email && !!errors.email}
                  />

                  <UserPhoneNumbersFieldArray />

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
                    component={FormikSelect}
                    fullWidth
                    select
                    required
                    variant="outlined"
                    label={fieldLabels[UserField.role]}
                    name={UserField.role}
                    error={touched.role && !!errors.role}>
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
