import { Autocomplete, TextField as FormikTextField } from 'formik-mui';
import {
  AutocompleteRenderInputParams,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import {
  UserField,
  fieldLabels,
  newEditValidationSchema,
  newUserTemplate,
} from './state';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { IUser } from 'src/shared/types';
import { UserRoleEnum } from 'src/shared/enums';
import { saveUserAsync } from 'src/shared/api';
import { useHealthFacilities } from 'src/shared/hooks/healthFacilities';
import { useState } from 'react';
import { userRoleLabels } from 'src/shared/constants';

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
    user: IUser,
    { setSubmitting }: FormikHelpers<IUser>
  ) => {
    try {
      await saveUserAsync(user, editUser?.userId);

      onClose();
    } catch (e) {
      setSubmitting(false);
      setSubmitError(true);
    }
  };

  return (
    <>
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogTitle>{creatingNew ? 'Create' : 'Edit'} User</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={editUser ?? newUserTemplate}
            validationSchema={newEditValidationSchema(creatingNew, emailsInUse)}
            onSubmit={handleSubmit}>
            {({ values, touched, errors, isSubmitting, isValid }) => (
              <Form>
                <br />
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
                  component={FormikTextField}
                  fullWidth
                  required
                  inputProps={{ maxLength: 25 }}
                  variant="outlined"
                  label={fieldLabels[UserField.phoneNumber]}
                  name={UserField.phoneNumber}
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
                  {Object.entries(userRoleLabels).map(([value, name]) => (
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
                  <CancelButton type="button" onClick={onClose}>
                    Cancel
                  </CancelButton>
                  <PrimaryButton
                    type="submit"
                    disabled={isSubmitting || !isValid}>
                    {creatingNew ? 'Create' : 'Save'}
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

export default EditUser;
