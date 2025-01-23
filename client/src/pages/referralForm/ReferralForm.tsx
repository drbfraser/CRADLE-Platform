import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Field, Form, Formik } from 'formik';
import {
  Autocomplete,
  AutocompleteRenderInputParams,
  TextField as FormikTextField,
} from 'formik-mui';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid2';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { PrimaryButton } from 'src/shared/components/Button';
import { saveReferralAsync } from 'src/shared/api/api';
import { useHealthFacilities } from 'src/shared/hooks/healthFacilities';
import {
  ReferralField,
  ReferralState,
  initialState,
  validationSchema,
} from './state';
import { Typography } from '@mui/material';

interface IProps {
  patientId: string;
}

export const ReferralForm = ({ patientId }: IProps) => {
  const [submitError, setSubmitError] = useState(false);
  const navigate = useNavigate();
  const healthFacilities = useHealthFacilities();

  const handleSubmit = async (
    values: ReferralState,
    { setSubmitting }: any
  ) => {
    const postBody = {
      patientId,
      ...values,
    };

    try {
      await saveReferralAsync(postBody);

      navigate(`/patients/${patientId}`, {
        state: {
          toast: {
            type: 'success',
            message: 'Referral submitted successfully',
          },
        },
      });
    } catch (e) {
      console.error(e);
      setSubmitError(true);
      setSubmitting(false);
    }
  };

  return (
    <>
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />

      <Formik
        initialValues={initialState}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}>
        {({ touched, errors, isSubmitting }) => (
          <Form>
            <Paper sx={{ marginBottom: '2rem', padding: '2rem' }}>
              <Typography
                sx={{ marginBottom: '1rem' }}
                variant="h4"
                component="h2">
                Referral
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <Field
                    component={Autocomplete}
                    fullWidth
                    name={ReferralField.healthFacility}
                    options={healthFacilities}
                    disableClearable={true}
                    renderInput={(params: AutocompleteRenderInputParams) => (
                      <TextField
                        {...params}
                        name={ReferralField.healthFacility}
                        error={
                          touched[ReferralField.healthFacility] &&
                          !!errors[ReferralField.healthFacility]
                        }
                        helperText={
                          touched[ReferralField.healthFacility]
                            ? errors[ReferralField.healthFacility]
                            : ''
                        }
                        label="Refer To"
                        variant="outlined"
                        required
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Field
                    component={FormikTextField}
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    name={ReferralField.comment}
                    label="Comments"
                  />
                </Grid>
              </Grid>
            </Paper>

            <PrimaryButton
              sx={{ float: 'right' }}
              type="submit"
              disabled={isSubmitting}>
              Submit Referral
            </PrimaryButton>
          </Form>
        )}
      </Formik>
    </>
  );
};
