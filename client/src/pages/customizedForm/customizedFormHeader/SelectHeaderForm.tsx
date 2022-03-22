import { makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import { Field, Form, Formik } from 'formik';
import {
  Autocomplete,
  AutocompleteRenderInputParams,
} from 'formik-material-ui-lab';
import React, { useState } from 'react';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { handleSubmit } from './handlers';
import { initialState, ReferralField, validationSchema } from './state';
import availableForms from './Forms.json';
import availableLangs from './Lang.json';

import { Question } from 'src/shared/types';

interface IProps {
  patientId: string;
  setQuestions: (questions: Question[]) => void;
}

export type customizedForm = {
  name: string;
  type: string;
};

export const SelectHeaderForm = ({ patientId, setQuestions }: IProps) => {
  const classes = useStyles();
  const [submitError, setSubmitError] = useState(false);

  const all_forms: string[] = availableForms.map(function (item) {
    return item.name;
  });
  const all_langs: string[] = availableLangs;

  return (
    <>
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <Formik
        initialValues={initialState}
        validationSchema={validationSchema}
        onSubmit={handleSubmit(patientId, setSubmitError, setQuestions)}>
        {({ touched, errors, isSubmitting }) => (
          <Form>
            <Paper>
              <Box p={2}>
                <h2>Form Template</h2>
                <Box pt={1} pl={3} pr={3}>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Field
                        component={Autocomplete}
                        fullWidth
                        name={ReferralField.form}
                        options={all_forms}
                        disableClearable={true}
                        renderInput={(
                          params: AutocompleteRenderInputParams
                        ) => (
                          <TextField
                            {...params}
                            name={ReferralField.form}
                            error={
                              touched[ReferralField.form] &&
                              !!errors[ReferralField.form]
                            }
                            helperText={
                              touched[ReferralField.form]
                                ? errors[ReferralField.form]
                                : ''
                            }
                            label="Form"
                            variant="outlined"
                            required
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Field
                        component={Autocomplete}
                        fullWidth
                        name={ReferralField.lang}
                        options={all_langs}
                        disableClearable={true}
                        renderInput={(
                          params: AutocompleteRenderInputParams
                        ) => (
                          <TextField
                            {...params}
                            name={ReferralField.lang}
                            error={
                              touched[ReferralField.lang] &&
                              !!errors[ReferralField.lang]
                            }
                            helperText={
                              touched[ReferralField.lang]
                                ? errors[ReferralField.lang]
                                : ''
                            }
                            label="Language"
                            variant="outlined"
                            required
                          />
                        )}
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
              Fetch Form
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
