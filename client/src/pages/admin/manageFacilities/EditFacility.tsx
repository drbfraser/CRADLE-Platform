import { useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
} from '@mui/material';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { TextField } from 'formik-mui';

import { Facility } from 'src/shared/types';
import { saveHealthFacilityAsync } from 'src/shared/api/api';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import { PhoneNumberField } from 'src/shared/components/Form/PhoneNumberField';
import {
  FacilityField,
  facilityTemplate,
  facilityTypes,
  makeFacilityValidationSchema,
} from './state';

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
  const otherFacilityNames = otherFacilities.map((facility) => facility.name);

  const validationSchema = makeFacilityValidationSchema(
    otherFacilityNames,
    otherPhoneNumbers
  );

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

      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogTitle>{creatingNew ? 'Create' : 'Edit'} Facility</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={editFacility ?? facilityTemplate}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}>
            {({ isSubmitting, isValid }) => (
              <Form>
                <Stack sx={{ paddingY: '1rem' }} spacing="2rem">
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
                  <PhoneNumberField
                    label={'Phone Number'}
                    name={'phoneNumber'}
                  />
                  <Field
                    component={TextField}
                    fullWidth
                    inputProps={{ maxLength: 50 }}
                    variant="outlined"
                    label="Location"
                    name="location"
                  />
                  <Field
                    component={TextField}
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    label="About"
                    name="about"
                  />
                </Stack>

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
