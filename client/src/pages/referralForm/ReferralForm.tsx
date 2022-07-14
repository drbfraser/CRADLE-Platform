import {
  Autocomplete,
  AutocompleteRenderInputParams,
} from 'formik-material-ui-lab';
import { Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import {
  ReferralField,
  ReferralState,
  initialState,
  validationSchema,
} from './state';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import Box from '@material-ui/core/Box';
import { TextField as FormikTextField } from 'formik-material-ui';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { PrimaryButton } from 'src/shared/components/Button';
import TextField from '@material-ui/core/TextField';
import { goBackWithFallback } from 'src/shared/utils';
import { makeStyles } from '@material-ui/core';
import { saveReferralAsync } from 'src/shared/api';
import { useHealthFacilities } from 'src/shared/hooks/healthFacilities';

interface IProps {
  patientId: string;
}

export const ReferralForm = ({ patientId }: IProps) => {
  const classes = useStyles();

  const healthFacilities = useHealthFacilities();
  const [submitError, setSubmitError] = useState(false);

  const handleSubmit = async (
    values: ReferralState,
    { setSubmitting }: any
  ) => {
    const postBody = JSON.stringify({
      patientId: patientId,
      ...values,
    });

    try {
      await saveReferralAsync(postBody);

      goBackWithFallback('/patients');
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
            <Paper>
              <Box p={2}>
                <h2>Referral</h2>
                <Box pt={1} pl={3} pr={3}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Field
                        component={Autocomplete}
                        fullWidth
                        name={ReferralField.healthFacility}
                        options={healthFacilities}
                        disableClearable={true}
                        renderInput={(
                          params: AutocompleteRenderInputParams
                        ) => (
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
                    <Grid item xs={12}>
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
                </Box>
              </Box>
            </Paper>
            <br />
            <PrimaryButton
              className={classes.right}
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

const useStyles = makeStyles({
  right: {
    float: 'right',
  },
});
