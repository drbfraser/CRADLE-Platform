import { makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import { TextField as FormikTextField } from 'formik-material-ui';
import { Field, Form, Formik } from 'formik';
import {
  Autocomplete,
  AutocompleteRenderInputParams,
} from 'formik-material-ui-lab';
import React, { useState } from 'react';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { useHealthFacilities } from 'src/shared/hooks/healthFacilities';
import { handleSubmit } from './handlers';
import { initialState, ReferralField, validationSchema } from './state';

interface IProps {
  patientId: string;
}

export const ReferralForm = ({ patientId }: IProps) => {
  const classes = useStyles();
  const healthFacilities = useHealthFacilities();
  const [submitError, setSubmitError] = useState(false);

  return (
    <>
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <Formik
        initialValues={initialState}
        validationSchema={validationSchema}
        onSubmit={handleSubmit(patientId, setSubmitError)}>
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
            <Button
              className={classes.right}
              color="primary"
              variant="contained"
              size="large"
              type="submit"
              disabled={isSubmitting}>
              Submit Referral
            </Button>
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
