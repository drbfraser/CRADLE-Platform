import React, { useState } from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@material-ui/core';
import {
  UserField,
  newEditValidationSchema,
  newUserTemplate,
  fieldLabels,
} from './state';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { TextField as FormikTextField } from 'formik-material-ui';
import {
  Autocomplete,
  AutocompleteRenderInputParams,
} from 'formik-material-ui-lab';
import { apiFetch } from 'src/shared/utils/api';
import { BASE_URL } from 'src/server/utils';
import { EndpointEnum } from 'src/server';
import { Toast } from 'src/shared/components/toast';
import { useHealthFacilities } from 'src/shared/hooks/healthFacilities';
import { IUser } from 'src/types';
import { UserRoleEnum, userRoles } from 'src/enums';

interface IProps {
  open: boolean;
  onClose: () => void;
  users: IUser[];
  editUser?: IUser;
}

const EditUser = ({ open, onClose, users, editUser }: IProps) => {
  const healthFacilities = useHealthFacilities();
  const [submitError, setSubmitError] = useState(false);
  const creatingNew = editUser === undefined;
  const emailsInUse = users
    .filter((u) => u.userId !== editUser?.userId)
    .map((u) => u.email);

  const handleSubmit = async (
    values: IUser,
    { setSubmitting }: FormikHelpers<IUser>
  ) => {
    try {
      const url =
        BASE_URL +
        (editUser
          ? EndpointEnum.USER + String(editUser.userId)
          : EndpointEnum.USER_REGISTER);

      const init = {
        method: creatingNew ? 'POST' : 'PUT',
        body: JSON.stringify({
          ...values,
          supervises: values.role === UserRoleEnum.CHO ? values.supervises : [],
        }),
      };

      const resp = await apiFetch(url, init);

      if (!resp.ok) {
        throw new Error('Request failed.');
      }

      onClose();
    } catch (e) {
      setSubmitting(false);
      setSubmitError(true);
    }
  };

  return (
    <>
      {submitError && (
        <Toast
          status="error"
          message="Something went wrong saving. Please try again."
          clearMessage={() => setSubmitError(false)}
        />
      )}
      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogTitle>{creatingNew ? 'Create' : 'Edit'} User</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={editUser ?? newUserTemplate}
            validationSchema={newEditValidationSchema(creatingNew, emailsInUse)}
            onSubmit={handleSubmit}>
            {({ values, touched, errors, isSubmitting, isValid }) => (
              <Form>
                <Field
                  component={FormikTextField}
                  fullWidth
                  required
                  inputProps={{ maxLength: 25 }}
                  variant="outlined"
                  label={fieldLabels[UserField.firstName]}
                  name={UserField.firstName}
                />
                <br />
                <br />
                <Field
                  component={FormikTextField}
                  fullWidth
                  required
                  inputProps={{ maxLength: 120 }}
                  variant="outlined"
                  label={fieldLabels[UserField.email]}
                  name={UserField.email}
                />
                <br />
                <br />
                <Field
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
                <br />
                <Field
                  component={FormikTextField}
                  fullWidth
                  select
                  required
                  variant="outlined"
                  label={fieldLabels[UserField.role]}
                  name={UserField.role}>
                  {Object.entries(userRoles).map(([value, name]) => (
                    <MenuItem key={value} value={value}>
                      {name}
                    </MenuItem>
                  ))}
                </Field>
                {values.role === UserRoleEnum.CHO && (
                  <>
                    <br />
                    <br />
                    <Field
                      component={FormikTextField}
                      variant="outlined"
                      fullWidth
                      select
                      SelectProps={{
                        multiple: true,
                        renderValue: (ids: number[]) =>
                          ids
                            .map(
                              (id) =>
                                users.find((u) => u.userId === id)?.firstName ??
                                'Unknown'
                            )
                            .join(', '),
                      }}
                      label={fieldLabels[UserField.supervises]}
                      name={UserField.supervises}>
                      {users
                        .filter(
                          (u) =>
                            editUser?.supervises.includes(u.userId) ||
                            (u.role === UserRoleEnum.VHT &&
                              u.userId !== editUser?.userId)
                        )
                        .map((user) => (
                          <MenuItem key={user.userId} value={user.userId}>
                            <Checkbox
                              checked={
                                values.supervises.indexOf(user.userId) >= 0
                              }
                            />
                            {user.firstName} ({user.email})
                          </MenuItem>
                        ))}
                    </Field>
                  </>
                )}
                {creatingNew && (
                  <>
                    <br />
                    <br />
                    <Field
                      component={FormikTextField}
                      fullWidth
                      required
                      variant="outlined"
                      type="password"
                      label={fieldLabels[UserField.password]}
                      name={UserField.password}
                    />
                    <br />
                    <br />
                    <Field
                      component={FormikTextField}
                      fullWidth
                      required
                      variant="outlined"
                      type="password"
                      label={fieldLabels[UserField.confirmPassword]}
                      name={UserField.confirmPassword}
                    />
                  </>
                )}
                <DialogActions>
                  <Button type="button" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !isValid}>
                    {creatingNew ? 'Create' : 'Save'}
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

export default EditUser;
