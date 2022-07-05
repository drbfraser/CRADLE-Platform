import {
  Autocomplete,
  AutocompleteRenderInputParams,
} from 'formik-material-ui-lab';
import { CForm, FormTemplate } from 'src/shared/types';
import {
  CustomizedFormField,
  CustomizedFormState,
  initialState,
  validationSchema,
} from './state';
import { Field, Form, Formik } from 'formik';
import React, { useState } from 'react';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import { getFormTemplateLangsAsync } from 'src/shared/api';
import { handleSubmit } from './handlers';
import { makeStyles } from '@material-ui/core';

interface IProps {
  setForm: (form: CForm) => void;
  templates: FormTemplate[];
}

export const SelectHeaderForm = ({
  setForm,
  templates: formTemplates,
}: IProps) => {
  const classes = useStyles();
  const [submitError, setSubmitError] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);

  const all_forms: string[] = formTemplates.map(function (item) {
    return item.classification.name; //id is a string here
  });

  const form_name_id_map = new Map<string, string>();
  formTemplates.map((item) =>
    form_name_id_map.set(item.classification.name, item.id)
  );

  const fetchAllLangVersions = async (form_template_id: string) => {
    try {
      const formTemplate = await getFormTemplateLangsAsync(form_template_id);

      setAvailableLanguages(formTemplate.lang_versions);
    } catch (e) {
      console.log('Error Loading !!!!!!');
    }
  };

  const handleSelectForm = (event: any, selectedFormName: any) => {
    const formTemplateId = form_name_id_map.get(selectedFormName);
    formTemplateId && fetchAllLangVersions(formTemplateId);
  };

  return (
    <>
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <Formik
        initialValues={initialState}
        validationSchema={validationSchema}
        onSubmit={(
          customizedFormState: CustomizedFormState,
          { setSubmitting }: any
        ) =>
          handleSubmit(
            formTemplates,
            setSubmitError,
            setForm,
            customizedFormState,
            setSubmitting
          )
        }>
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
                        options={availableLanguages}
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
    display: 'flex',
    marginRight: '0px',
    marginLeft: 'auto',
    margin: '10px',
  },
});
