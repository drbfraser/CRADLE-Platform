import { useMutation } from '@tanstack/react-query';
import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormGroup,
} from '@mui/material';
import { TextField } from 'formik-mui';

import { RelayNum } from 'src/shared/types';
import { saveRelayNumAsync } from 'src/shared/api/api';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { Toast } from 'src/shared/components/toast';
import {
  makePhoneNumberValidationSchema,
  PhoneNumberField,
} from 'src/shared/components/Form/PhoneNumberField';
import { RelayNumField } from './state';

interface IProps {
  open: boolean;
  onClose: () => void;
  relayNums: RelayNum[];
  editRelayNum?: RelayNum;
}

const EditRelayNumDialog = ({
  open,
  onClose,
  relayNums,
  editRelayNum,
}: IProps) => {
  const updateRelayNum = useMutation({
    mutationFn: saveRelayNumAsync,
  });

  if (!editRelayNum) return null;

  const otherRelayNums = relayNums.filter(
    (relayNum) => relayNum.phoneNumber !== editRelayNum.phoneNumber
  );
  const otherPhoneNumbers = otherRelayNums.map(
    (relayNum) => relayNum.phoneNumber
  );
  const validationSchema = Yup.object().shape({
    phoneNumber: makePhoneNumberValidationSchema(otherPhoneNumbers),
  });

  const handleSubmit = (values: RelayNum) => {
    updateRelayNum.mutate(values, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <>
      <Toast
        severity="success"
        message="Number Successfully Updated!"
        open={updateRelayNum.isSuccess}
        onClose={() => updateRelayNum.reset()}
      />
      {updateRelayNum.isError && (
        <APIErrorToast onClose={() => updateRelayNum.reset()} />
      )}

      <Dialog open={open} maxWidth="md" fullWidth>
        <DialogTitle>Edit Relay Server Phone Number</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={editRelayNum}
            validationSchema={validationSchema}
            validateOnBlur
            onSubmit={handleSubmit}>
            {({ isValid }) => (
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
                      disabled={updateRelayNum.isPending || !isValid}>
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

export default EditRelayNumDialog;
