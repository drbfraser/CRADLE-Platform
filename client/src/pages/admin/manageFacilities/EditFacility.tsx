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
import { Facility } from 'src/shared/types';
import { saveHealthFacilityAsync } from 'src/shared/api/api';
import { useState } from 'react';
import { PhoneNumberField } from 'src/shared/components/Form/PhoneNumberField';
import { isValidNumber } from 'libphonenumber-js';

interface IProps {
  open: boolean;
  onClose: () => void;
  facilities: Facility[];
  editFacility?: Facility;
}

const EditFacility = ({ open, onClose, facilities, editFacility }: IProps) => {
  const [submitError, setSubmitError] = useState(false);
  const creatingNew = editFacility === undefined;

  const otherFacilities = facilities.filter(
    (facility) => facility.name !== editFacility?.name
  );
  const otherPhoneNumbers = otherFacilities.map(
    (facility) => facility.phoneNumber
  );

  const validateFacilityPhoneNumber = (phoneNumber: string) => {
    if (!isValidNumber(phoneNumber)) {
      return 'Invalid Phone Number';
    }
    if (otherPhoneNumbers.includes(phoneNumber)) {
      return 'Phone Number Already In Use';
    }

    return undefined;
  };

  const handleSubmit = async (
    values: Facility,
    { setSubmitting }: FormikHelpers<Facility>
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
      <Dialog open={open} maxWidth={'sm'} fullWidth>
        <DialogTitle>{creatingNew ? 'Create' : 'Edit'} Facility</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={editFacility ?? facilityTemplate}
            validationSchema={getValidationSchema(
              creatingNew ? facilities.map((f) => f.name) : []
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
                <PhoneNumberField
                  label={'Phone Number'}
                  name={'phoneNumber'}
                  validatePhoneNumber={validateFacilityPhoneNumber}
                />
                <br />
                <br />
                <Field
                  component={TextField}
                  fullWidth
                  inputProps={{ maxLength: 50 }}
                  variant="outlined"
                  label="Location"
                  name={'location'}
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
                  name={'about'}
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
