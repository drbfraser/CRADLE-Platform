import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { RelayNumField, RelayNumTemplate, getValidationSchema } from './state';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { TextField } from 'formik-mui';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { IRelayNum } from 'src/shared/types';
import { useState } from 'react';
import { saveRelayNumAsync } from 'src/shared/api';
import { Toast } from 'src/shared/components/toast';

interface IProps {
  open: boolean;
  onClose: () => void;
  relayNums: IRelayNum[];
  editRelayNum?: IRelayNum;
}

const EditRelayNum = ({ open, onClose, relayNums, editRelayNum }: IProps) => {
  const [submitError, setSubmitError] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const creatingNew = editRelayNum === undefined;

  const handleSubmit = async (
    values: IRelayNum,
    { setSubmitting }: FormikHelpers<IRelayNum>
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

  return (
    <>
      <Toast
        severity="success"
        message="Number Successfully Updated!"
        open={submitSuccess}
        onClose={() => setSubmitSuccess(false)}
      />
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <Dialog open={open} maxWidth="md" fullWidth>
        <DialogTitle>Edit Number</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={editRelayNum ?? RelayNumTemplate}
            validationSchema={getValidationSchema(
              creatingNew ? relayNums.map((num) => num.phone) : []
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
                  name={RelayNumField.phone}
                />
                <br />
                <br />
                <Field
                  component={TextField}
                  fullWidth
                  inputProps={{ maxLength: 50 }}
                  variant="outlined"
                  name={RelayNumField.description}
                />
                <br />
                <br />
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
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditRelayNum;
