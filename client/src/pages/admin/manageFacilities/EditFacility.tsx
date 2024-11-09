import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
} from '@mui/material';
import {
  FacilityField,
  facilityTemplate,
  facilityTypes,
  getValidationSchema,
} from './state';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { TextField } from 'formik-mui';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { IFacility } from 'src/shared/types';
import { saveHealthFacilityAsync } from 'src/shared/api/api';
import { useState } from 'react';

interface IProps {
  open: boolean;
  onClose: () => void;
  facilities: IFacility[];
  editFacility?: IFacility;
}

const EditFacility = ({ open, onClose, facilities, editFacility }: IProps) => {
  const [submitError, setSubmitError] = useState(false);
  const creatingNew = editFacility === undefined;

  const handleSubmit = async (
    values: IFacility,
    { setSubmitting }: FormikHelpers<IFacility>
  ) => {
    try {
      await saveHealthFacilityAsync(values);

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
        <DialogTitle>{creatingNew ? 'Create' : 'Edit'} Facility</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={editFacility ?? facilityTemplate}
            validationSchema={getValidationSchema(
              creatingNew ? facilities.map((f) => f.healthFacilityName) : []
            )}
            onSubmit={handleSubmit}>
            {({ isSubmitting, isValid }) => (
              <Form>
                <Field
                  component={TextField}
                  fullWidth
                  required
                  inputProps={{ maxLength: 50 }}
                  variant="outlined"
                  label="Facility Name"
                  name={FacilityField.name}
                  disabled={!creatingNew}
                />
                <br />
                <br />
                <Field
                  component={TextField}
                  fullWidth
                  select
                  required
                  label="Facility Type"
                  name={FacilityField.type}>
                  {facilityTypes.map((facilityType) => (
                    <MenuItem key={facilityType} value={facilityType}>
                      {facilityType}
                    </MenuItem>
                  ))}
                </Field>
                <br />
                <br />
                <Field
                  component={TextField}
                  fullWidth
                  inputProps={{ maxLength: 50 }}
                  variant="outlined"
                  label="Phone Number"
                  name={FacilityField.phoneNumber}
                />
                <br />
                <br />
                <Field
                  component={TextField}
                  fullWidth
                  inputProps={{ maxLength: 50 }}
                  variant="outlined"
                  label="Location"
                  name={FacilityField.location}
                />
                <br />
                <br />
                <Field
                  component={TextField}
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  label="About"
                  name={FacilityField.about}
                />
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

export default EditFacility;
