import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Field, Form, Formik } from 'formik';
import * as yup from 'yup';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from '@mui/material';
import { addRelayServerPhone } from 'src/shared/api';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import { RelayNum } from 'src/shared/types';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';

const RELAY_NUMBER_TEMPLATE = {
  phoneNumber: '',
  description: '',
  lastReceived: 0,
};

const NEW_NUMBER_VALIDATION_SCHEMA = yup.object({
  phoneNumber: yup.string().required('Required').max(20),
  description: yup.string().max(250),
});

type Props = {
  open: boolean;
  onClose: () => void;
};

const AddRelayNumDialog = ({ open, onClose }: Props) => {
  const queryClient = useQueryClient();

  const addNewRelayServerPhone = useMutation({
    mutationFn: ({ phoneNumber, description }: RelayNum) =>
      addRelayServerPhone(phoneNumber, description),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['relayNumbers'] }),
  });

  const handleSubmit = (values: RelayNum) => {
    addNewRelayServerPhone.mutate(values);
  };

  return (
    <>
      {addNewRelayServerPhone.isError && (
        <APIErrorToast onClose={() => addNewRelayServerPhone.reset()} />
      )}

      <Dialog open={open} maxWidth="md" fullWidth>
        <DialogTitle>Add Number</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={RELAY_NUMBER_TEMPLATE}
            validationSchema={NEW_NUMBER_VALIDATION_SCHEMA}
            onSubmit={handleSubmit}>
            {({ isValid, errors, dirty }) => (
              <Form>
                <Grid container spacing={3} sx={{ paddingTop: 1 }}>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      required
                      inputProps={{ maxLength: 50 }}
                      variant="outlined"
                      label="Phone Number"
                      name={'phoneNumber'}
                      error={errors.phoneNumber !== undefined}
                      helperText={errors.phoneNumber}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      inputProps={{ maxLength: 300 }}
                      variant="outlined"
                      label="Description"
                      name={'description'}
                      error={errors.description !== undefined}
                      helperText={errors.description}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <DialogActions>
                      <CancelButton
                        type="button"
                        onClick={() => {
                          onClose();
                        }}>
                        Cancel
                      </CancelButton>
                      <PrimaryButton
                        type="submit"
                        disabled={
                          addNewRelayServerPhone.isPending || !isValid || !dirty
                        }
                        onClick={() => {
                          onClose();
                        }}>
                        Save
                      </PrimaryButton>
                    </DialogActions>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddRelayNumDialog;
