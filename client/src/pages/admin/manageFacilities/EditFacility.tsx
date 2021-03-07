import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@material-ui/core';
import {
  FacilityField,
  facilityTemplate,
  getValidationSchema,
  IFacility,
} from './state';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { TextField } from 'formik-material-ui';
import { apiFetch } from 'src/shared/utils/api';
import { BASE_URL } from 'src/server/utils';
import { EndpointEnum } from 'src/server';
import { Toast } from 'src/shared/components/toast';
import { useDispatch } from 'react-redux';
import { getHealthFacilityList } from 'src/redux/reducers/healthFacilities';

interface IProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  refreshFacilities: () => Promise<void>;
  facilities: IFacility[];
  editFacility?: IFacility;
}

const EditFacility = ({
  open,
  setOpen,
  refreshFacilities,
  facilities,
  editFacility,
}: IProps) => {
  const dispatch = useDispatch();
  const [submitError, setSubmitError] = useState(false);
  const creatingNew = editFacility === undefined;

  const handleSubmit = async (
    values: IFacility,
    { setSubmitting }: FormikHelpers<IFacility>
  ) => {
    try {
      const resp = await apiFetch(BASE_URL + EndpointEnum.HEALTH_FACILITIES, {
        method: 'POST',
        body: JSON.stringify(values),
      });

      if (!resp.ok) {
        throw new Error('Request failed.');
      }

      // refresh the facility list used elsewhere in the application
      dispatch(getHealthFacilityList());

      refreshFacilities();
      setOpen(false);
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
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth>
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
                  <Button type="button" onClick={() => setOpen(false)}>
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

export default EditFacility;
