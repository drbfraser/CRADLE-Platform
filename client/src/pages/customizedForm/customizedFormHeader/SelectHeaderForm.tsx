import { Autocomplete, AutocompleteRenderInputParams } from 'formik-mui';
import { CForm, FormTemplate } from 'src/shared/types';
import {
  CustomizedFormField,
  CustomizedFormState,
  initialState,
  validationSchema,
} from './state';
import { Field, Form, Formik } from 'formik';
import {
  getFormTemplateLangAsync,
  getFormTemplateLangsAsync,
  getFormTemplatesAsync,
} from 'src/shared/api';
import { useEffect, useState } from 'react';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { PrimaryButton } from 'src/shared/components/Button';
import { Skeleton } from '@mui/material';
import TextField from '@mui/material/TextField';
import makeStyles from '@mui/styles/makeStyles';

interface IProps {
  setForm: (form: CForm) => void;
}

export const SelectHeaderForm = ({ setForm }: IProps) => {
  const classes = useStyles();
  const [submitError, setSubmitError] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [formTemplates, setFormTemplates] = useState<FormTemplate[]>([]);
  const [resetLanguage, setResetLanguage] = useState<boolean>(false);

  useEffect(() => {
    const updateFormTemplates = async () => {
      try {
        setFormTemplates(await getFormTemplatesAsync(false));
      } catch (e) {
        console.log(e);
      }
    };

    updateFormTemplates();
  }, []);

  const allForms: string[] = formTemplates.map(function (item) {
    return item.classification.name; //id is a string here
  });

  const formNameIdMap = new Map<string, string>(
    formTemplates.map((item) => [item.classification.name, item.id])
  );

  const fetchAllLangVersions = async (form_template_id: string) => {
    try {
      const formTemplate = await getFormTemplateLangsAsync(form_template_id);

      setAvailableLanguages(formTemplate.lang_versions);
      setResetLanguage(!resetLanguage);
    } catch (e) {
      console.log('Error Loading !!!!!!');
    }
  };

  const handleSelectForm = (_: any, selectedFormName: any) => {
    const formTemplateId = formNameIdMap.get(selectedFormName);
    formTemplateId && fetchAllLangVersions(formTemplateId);
  };

  const handleSubmit = async (
    customizedFormState: CustomizedFormState,
    { setSubmitting }: { setSubmitting: (submitting: boolean) => void }
  ) => {
    const formNameIdMap = new Map<string, string>(
      formTemplates.map((item) => [item.classification.name, item.id])
    );

    const formTemplateId: string =
      customizedFormState.name !== null
        ? formNameIdMap.get(customizedFormState.name) ?? ''
        : '';

    try {
      setForm(
        await getFormTemplateLangAsync(
          formTemplateId,
          customizedFormState.lang ?? ''
        )
      );
    } catch (e) {
      console.error(e);
      setSubmitError(true);
      setSubmitting(false);
    }
  };
  return (
    <>
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      {formTemplates.length > 0 ? (
        <Formik
          initialValues={initialState}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}>
          {({ touched, errors, isSubmitting }) => (
            <Form>
              <Paper>
                <Box p={2} m={2}>
                  <h2>Form Template</h2>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Field
                        component={Autocomplete}
                        fullWidth
                        name={CustomizedFormField.name}
                        options={allForms}
                        disableClearable={true}
                        onInputChange={handleSelectForm}
                        renderInput={(
                          params: AutocompleteRenderInputParams
                        ) => (
                          <TextField
                            {...params}
                            name={CustomizedFormField.name}
                            error={
                              !!touched[CustomizedFormField.name] &&
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
                        key={resetLanguage}
                        value={undefined}
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
                              !!touched[CustomizedFormField.lang] &&
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

                  <PrimaryButton
                    className={classes.right}
                    type="submit"
                    disabled={isSubmitting}>
                    Fetch Form
                  </PrimaryButton>
                </Box>
              </Paper>
            </Form>
          )}
        </Formik>
      ) : (
        <Skeleton variant="rectangular" height={150} />
      )}
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
