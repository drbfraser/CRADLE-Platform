import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import {
  Autocomplete,
  AutocompleteRenderInputParams,
  TextField as FormikTextField,
} from 'formik-mui';
import { TextField, Typography, Paper } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { saveReferralAsync } from 'src/shared/api';
import { useHealthFacilityNames } from 'src/shared/hooks/healthFacilityNames';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { PrimaryButton } from 'src/shared/components/Button';
import { ToastData } from 'src/shared/components/toastAfterNav';
import {
  ReferralField,
  ReferralState,
  initialState,
  validationSchema,
} from './state';

interface IProps {
  patientId: string;
}

export const ReferralForm = ({ patientId }: IProps) => {
  const healthFacilityNames = useHealthFacilityNames();
  const navigate = useNavigate();

  const addReferral = useMutation({
    mutationFn: (
      postBody: {
        patientId: string;
      } & ReferralState
    ) => {
      return saveReferralAsync(postBody);
    },
  });

  const handleSubmit = async (
    values: ReferralState,
    { setSubmitting }: FormikHelpers<ReferralState>
  ) => {
    const postBody = {
      patientId,
      ...values,
    };
    addReferral.mutate(postBody, {
      onSuccess: () => {
        const toastData: ToastData = {
          severity: 'success',
          message: 'Referral submitted successfully',
        };
        navigate(`/patients/${patientId}`, {
          state: { toastData },
        });
      },
      onError: (e) => {
        console.error(e);
        setSubmitting(false);
      },
    });
  };

  return (
    <>
      {addReferral.isError && <APIErrorToast />}

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
                    options={healthFacilityNames}
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
