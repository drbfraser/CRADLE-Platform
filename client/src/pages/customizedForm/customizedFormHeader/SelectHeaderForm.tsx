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
import { initialState, CustomizedFormField, validationSchema } from './state';
import { CForm, FormSchema } from 'src/shared/types';

import { EndpointEnum } from 'src/shared/enums';
import { apiFetch, API_URL } from 'src/shared/api';

interface IProps {
  patientId: string;
  setForm: (form: CForm) => void;
  formSchemas: FormSchema[];
}

export const SelectHeaderForm = ({
  patientId,
  setForm,
  formSchemas,
}: IProps) => {
  const classes = useStyles();
  const [submitError, setSubmitError] = useState(false);
  const [availableLangs, setAvailableLangs] = useState<string[]>([]);

  const all_forms: string[] = formSchemas.map(function (item) {
    return item.name; //id is a string here
  });

  const form_name_id_map = new Map<string, string>();
  formSchemas.map((item) => form_name_id_map.set(item.name, item.id));

  const handleSelectForm = (event: any, values: any) => {
    const selectedFormName = values;
    fetchAllLangVersions(form_name_id_map.get(selectedFormName));
  };

  function fetchAllLangVersions(form_template_id: string | undefined) {
    apiFetch(
      API_URL +
        EndpointEnum.FORM_TEMPLATE +
        '/' +
        form_template_id +
        '/versions'
    )
      .then((resp) => resp.json())
      .then((lang_model) => {
        setAvailableLangs(lang_model.lang_versions);
        console.log(lang_model);
      })
      .catch(() => {
        console.log('Error Loading !!!!!!');
      });
  }

  return (
    <>
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <Formik
        initialValues={initialState}
        validationSchema={validationSchema}
        onSubmit={handleSubmit(
          patientId,
          formSchemas,
          setSubmitError,
          setForm
        )}>
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
                        name={CustomizedFormField.name}
                        options={all_forms}
                        disableClearable={true}
                        onInputChange={handleSelectForm}
                        renderInput={(
                          params: AutocompleteRenderInputParams
                        ) => (
                          <TextField
                            {...params}
                            name={CustomizedFormField.name}
                            error={
                              touched[CustomizedFormField.name] &&
                              !!errors[CustomizedFormField.name]
                            }
                            helperText={
                              touched[CustomizedFormField.name]
                                ? errors[CustomizedFormField.name]
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
                        name={CustomizedFormField.lang}
                        options={availableLangs}
                        disableClearable={true}
                        renderInput={(
                          params: AutocompleteRenderInputParams
                        ) => (
                          <TextField
                            {...params}
                            name={CustomizedFormField.lang}
                            error={
                              touched[CustomizedFormField.lang] &&
                              !!errors[CustomizedFormField.lang]
                            }
                            helperText={
                              touched[CustomizedFormField.lang]
                                ? errors[CustomizedFormField.lang]
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
