import { useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
} from '@mui/material';
import { Field, Form, Formik } from 'formik';
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
  selectedFacility?: Facility;
}

const EditFacilityDialog = ({
  open,
  onClose,
  facilities,
  selectedFacility,
}: IProps) => {
  const updateFacility = useMutation({
    mutationFn: saveHealthFacilityAsync,
  });

  const otherFacilities = facilities.filter(
    (facility) => facility.name !== selectedFacility?.name
  );
  const otherPhoneNumbers = otherFacilities.map(
    (facility) => facility.phoneNumber
  );
  const otherFacilityNames = otherFacilities.map((facility) => facility.name);

  const validationSchema = makeFacilityValidationSchema(
    otherFacilityNames,
    otherPhoneNumbers
  );

  const handleSubmit = (values: Facility) => {
    updateFacility.mutate(values, {
      onSuccess: () => onClose(),
    });
  };

  const creatingNew = selectedFacility === undefined;
  return (
    <>
      {updateFacility.isError && (
        <APIErrorToast onClose={() => updateFacility.reset()} />
      )}

      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogTitle>{creatingNew ? 'Create' : 'Edit'} Facility</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={selectedFacility ?? facilityTemplate}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}>
            {({ isValid }) => (
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
                    disabled={updateFacility.isPending || !isValid}>
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

export default EditFacilityDialog;
