import {
  Autocomplete,
  TextField as FormikTextField,
  Select as FormikSelect,
} from 'formik-mui';
import {
  AutocompleteRenderInputParams,
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
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { UserField, fieldLabels, newEditValidationSchema } from './state';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { UserRoleEnum } from 'src/shared/enums';
import { editUserAsync } from 'src/shared/api/api';
import { useHealthFacilities } from 'src/shared/hooks/healthFacilities';
import { useState } from 'react';
import { userRoleLabels } from 'src/shared/constants';
import { EditUser, User } from 'src/shared/api/validation/user';
import { AxiosError } from 'axios';

interface IProps {
  open: boolean;
  onClose: () => void;
  users: User[];
  editUser?: EditUser;
}

export const EditUserDialog = ({ open, onClose, users, editUser }: IProps) => {
  const healthFacilities = useHealthFacilities();
  const [submitError, setSubmitError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const emailsInUse = users
    .filter((u) => u.id !== editUser?.id)
    .map((u) => u.email);

  const handleSubmit = async (
    user: EditUser,
    { setSubmitting }: FormikHelpers<EditUser>
  ) => {
    if (!editUser) return;
    const editedUser = { ...user };

    /* If the phone number entered is not already in the user's array of 
    phone numbers, prepend it to the array. */
    if (user.phoneNumber && !user.phoneNumbers.includes(user.phoneNumber)) {
      editedUser.phoneNumbers = [user.phoneNumber, ...user.phoneNumbers];
    }
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

  const healthFacilityNames = healthFacilities.map((facility) => facility.name);

  if (!editUser) return null;
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
              supervises: editUser.supervises ?? [],
            }}
            validationSchema={newEditValidationSchema(emailsInUse)}
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
                  <Field
                    component={FormikTextField}
                    fullWidth
                    required
                    inputProps={{ maxLength: 25 }}
                    variant="outlined"
                    label={fieldLabels[UserField.name]}
                    name={UserField.name}
                  />
                  <Field
                    component={FormikTextField}
                    fullWidth
                    required
                    inputProps={{ maxLength: 120 }}
                    variant="outlined"
                    label={fieldLabels[UserField.email]}
                    name={UserField.email}
                  />
                  <Field
                    component={FormikTextField}
                    fullWidth
                    required
                    inputProps={{ maxLength: 25 }}
                    variant="outlined"
                    label={fieldLabels[UserField.phoneNumber]}
                    name={UserField.phoneNumber}
                  />
                  <Field
                    component={Autocomplete}
                    fullWidth
                    name={UserField.healthFacilityName}
                    options={healthFacilityNames}
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
                    component={FormikSelect}
                    fullWidth
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
                              editUser?.supervises?.includes(user.id) ||
                              (user.role === UserRoleEnum.VHT &&
                                user.id !== editUser?.id)
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
