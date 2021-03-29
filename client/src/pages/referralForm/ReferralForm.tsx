import { makeStyles, MenuItem } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import React, { useState } from 'react';
import { Toast } from 'src/shared/components/toast';
import { useHealthFacilityOptions } from 'src/shared/hooks/healthFacilityOptions';
import { handleSubmit } from './handlers';
import { initialState, ReferralField } from './state';

interface IProps {
  readingId: string;
}

export const ReferralForm = ({ readingId }: IProps) => {
  const classes = useStyles();
  const healthFacilityOptions = useHealthFacilityOptions();
  const [submitError, setSubmitError] = useState(false);

  return (
    <>
      {submitError && (
        <Toast
          status="error"
          message="Something went wrong on our end. Please try that again."
          clearMessage={() => setSubmitError(false)}
        />
      )}
      <Formik
        initialValues={initialState}
        onSubmit={handleSubmit(readingId, setSubmitError)}>
        {({ isSubmitting }) => (
          <Form>
            <Paper>
              <Box p={2}>
                <h2>Referral</h2>
                <Box pt={1} pl={3} pr={3}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Field
                        component={TextField}
                        fullWidth
                        select
                        required
                        variant="outlined"
                        label="Refer To"
                        name={ReferralField.healthFacility}>
                        {Object.entries(healthFacilityOptions).map(
                          ([_, { label, value }]) => (
                            <MenuItem key={value} value={value}>
                              {label}
                            </MenuItem>
                          )
                        )}
                      </Field>
                    </Grid>
                    <Grid item xs={12}>
                      <Field
                        component={TextField}
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
