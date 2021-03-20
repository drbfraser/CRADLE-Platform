import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
} from '@material-ui/core';
import {
  UserField,
  IUserEdit,
  IUserGet,
  newValidationSchema,
  editValidationSchema,
  userRoles,
} from './state';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { TextField } from 'formik-material-ui';
import { apiFetch } from 'src/shared/utils/api';
import { BASE_URL } from 'src/server/utils';
import { EndpointEnum } from 'src/server';
import { Toast } from 'src/shared/components/toast';
import { useHealthFacilityOptions } from 'src/shared/hooks/healthFacilityOptions';

interface IProps {
  open: boolean;
  onClose: () => void;
  users: IUserGet[];
  editUser?: IUserGet;
}

const EditUser = ({ open, onClose, users, editUser }: IProps) => {
  const healthFacilityOptions = useHealthFacilityOptions();
  const [submitError, setSubmitError] = useState(false);
  const creatingNew = editUser === undefined;

  const handleSubmit = async (
    values: IUserEdit,
    { setSubmitting }: FormikHelpers<IUserEdit>
  ) => {
    try {
      const resp = await apiFetch(BASE_URL + EndpointEnum.HEALTH_FACILITIES, {
        method: 'POST',
        body: JSON.stringify(values),
      });

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
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{creatingNew ? 'Create' : 'Edit'} User</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={editUser ?? {}}
            validationSchema={
              creatingNew ? newValidationSchema : editValidationSchema
            }
            onSubmit={handleSubmit}>
            {({ isSubmitting, isValid }) => (
              <Form>
                <Field
                  component={TextField}
                  fullWidth
                  required
                  inputProps={{ maxLength: 25 }}
                  variant="outlined"
                  label="First Name"
                  name={UserField.firstName}
                />
                <br />
                <br />
                <Field
                  component={TextField}
                  fullWidth
                  required
                  inputProps={{ maxLength: 120 }}
                  variant="outlined"
                  label="Email"
                  name={UserField.email}
                />
                <br />
                <br />
                <Field
                  component={TextField}
                  fullWidth
                  select
                  required
                  variant="outlined"
                  label="Health Facility"
                  name={UserField.healthFacilityName}>
                  {Object.entries(healthFacilityOptions).map(
                    ([_, { label, value }]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    )
                  )}
                </Field>
                <br />
                <br />
                <Field
                  component={TextField}
                  fullWidth
                  select
                  required
                  variant="outlined"
                  label="Role"
                  name={UserField.role}>
                  {Object.entries(userRoles).map(([value, name]) => (
                    <MenuItem key={value} value={value}>
                      {name}
                    </MenuItem>
                  ))}
                </Field>
                {creatingNew && (
                  <>
                    <br />
                    <br />
                    <Field
                      component={TextField}
                      fullWidth
                      required
                      variant="outlined"
                      type="password"
                      label="Password"
                      name={UserField.password}
                    />
                    <br />
                    <br />
                    <Field
                      component={TextField}
                      fullWidth
                      required
                      variant="outlined"
                      type="password"
                      label="Confirm Password"
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
