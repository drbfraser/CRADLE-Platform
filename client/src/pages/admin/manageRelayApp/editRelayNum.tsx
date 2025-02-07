import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormGroup,
} from '@mui/material';
import { RelayNumField } from './state';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { TextField } from 'formik-mui';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { RelayNum } from 'src/shared/types';
import { useState } from 'react';
import { saveRelayNumAsync } from 'src/shared/api/api';
import { Toast } from 'src/shared/components/toast';
import {
  makePhoneNumberValidationSchema,
  PhoneNumberField,
} from 'src/shared/components/Form/PhoneNumberField';
import * as Yup from 'yup';

interface IProps {
  open: boolean;
  onClose: () => void;
  relayNums: RelayNum[];
  editRelayNum?: RelayNum;
}

const EditRelayNum = ({ open, onClose, relayNums, editRelayNum }: IProps) => {
  const [submitError, setSubmitError] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!editRelayNum) return null;

  const otherRelayNums = relayNums.filter(
    (relayNum) => relayNum.phoneNumber !== editRelayNum.phoneNumber
  );
  const otherPhoneNumbers = otherRelayNums.map(
    (relayNum) => relayNum.phoneNumber
  );

  // const validatePhoneNumber = makePhoneNumberValidator(otherPhoneNumbers);

  console.log(editRelayNum);

  const handleSubmit = async (
    values: RelayNum,
    { setSubmitting }: FormikHelpers<RelayNum>
  ) => {
    try {
      await saveRelayNumAsync(values);

      setSubmitSuccess(true);
      onClose();
    } catch (e) {
      setSubmitting(false);
      setSubmitError(true);
    }
  };

  const validationSchema = Yup.object().shape({
    phoneNumber: makePhoneNumberValidationSchema(otherPhoneNumbers),
  });

  return (
    <>
      <Toast
        severity="success"
        message="Number Successfully Updated!"
        open={submitSuccess}
        onClose={() => setSubmitSuccess(false)}
      />
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <Dialog open={open} maxWidth="md" fullWidth sx={{}}>
        <DialogTitle>Edit Relay Server Phone Number</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={editRelayNum}
            validationSchema={validationSchema}
            validateOnBlur
            onSubmit={handleSubmit}>
            {({ isSubmitting, isValid }) => (
              <Form>
                <FormGroup
                  sx={{
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}>
                  <PhoneNumberField
                    name={RelayNumField.phoneNumber}
                    label={'Phone Number'}
                  />
                  <Field
                    component={TextField}
                    fullWidth
                    inputProps={{ maxLength: 50 }}
                    variant="outlined"
                    name={RelayNumField.description}
                    label={'Description'}
                  />
                  <DialogActions>
                    <CancelButton type="button" onClick={onClose}>
                      Cancel
                    </CancelButton>
                    <PrimaryButton
                      type="submit"
                      disabled={isSubmitting || !isValid}>
                      Save
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

export default EditRelayNum;
