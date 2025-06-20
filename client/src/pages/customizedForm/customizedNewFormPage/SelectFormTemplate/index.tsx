import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Field, Form, Formik } from 'formik';
import { Autocomplete, AutocompleteRenderInputParams } from 'formik-mui';
import {
  Box,
  Grid,
  Paper,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';

import { CForm } from 'src/shared/types/types';
import { getFormTemplateLangAsync } from 'src/shared/api';
import { useFormTemplatesQuery } from 'src/shared/queries';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { PrimaryButton } from 'src/shared/components/Button';
import { getLanguageName } from 'src/pages/admin/manageFormTemplates/editFormTemplate/utils';
import { CustomizedFormField, validationSchema } from './state';
import { useFormTemplateLangsQueries } from '../../queries';

const getDefaultLanguage = (languageOptions: string[]) => {
  // Check if fetched languages contain browser language
  const browserLanguage: string = getLanguageName(
    navigator.language || window.navigator.language
  );

  let defaultLang: string = languageOptions[0];
  languageOptions.forEach((languageOption: string) => {
    // If form languages contain browser language, update default form language
    // Else language is left as first language of array
    if (browserLanguage.includes(languageOption)) {
      defaultLang = languageOption;
    }
  });
  return defaultLang;
};

interface IProps {
  setForm: (form: CForm) => void;
}

// TODO: need to handle case where 2 forms share the same name
export const SelectFormTemplate = ({ setForm }: IProps) => {
  const [selectedFormName, setSelectedFormName] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');

  const submitForm = useMutation({
    mutationFn: async (values: { formId: string; lang: string }) => {
      setForm(await getFormTemplateLangAsync(values.formId, values.lang));
    },
  });

  const formTemplatesQuery = useFormTemplatesQuery(false);
  const formTemplateLangsQueries = useFormTemplateLangsQueries(
    formTemplatesQuery.data
  );
  if (
    formTemplatesQuery.data === undefined ||
    formTemplateLangsQueries.some(({ data }) => data === undefined)
  ) {
    return <Skeleton height={800} />;
  }

  const getAvailableLanguages = (selectedFormName: string) => {
    const index = formTemplatesQuery.data.findIndex(
      (form) => form.classification.name === selectedFormName
    );
    return formTemplateLangsQueries[index]?.data ?? [];
  };

  const handleSelectForm = async (_: unknown, selectedFormName: string) => {
    const defaultLanguage = getDefaultLanguage(
      getAvailableLanguages(selectedFormName)
    );
    setSelectedLanguage(defaultLanguage);
    setSelectedFormName(selectedFormName);
  };

  const handleSubmit = async () => {
    const formId = formTemplatesQuery.data.find(
      (form) => form.classification.name === selectedFormName
    )?.id;

    submitForm.mutate({
      formId: formId ?? '',
      lang: selectedLanguage,
    });
  };

  return (
    <>
      <APIErrorToast
        open={submitForm.isError}
        onClose={() => submitForm.reset()}
      />

      {formTemplatesQuery.data.length > 0 ? (
        <Formik
          initialValues={{ name: selectedFormName, lang: selectedLanguage }}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={handleSubmit}>
          {({ touched, errors }) => (
            <Form>
              <Paper sx={{ p: 4 }}>
                <h2>Form Template</h2>
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <Field
                      component={Autocomplete}
                      fullWidth
                      name={CustomizedFormField.name}
                      options={formTemplatesQuery.data.map(
                        (form) => form.classification.name
                      )}
                      disableClearable={true}
                      onInputChange={handleSelectForm}
                      renderInput={(params: AutocompleteRenderInputParams) => (
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
                      component={Autocomplete}
                      fullWidth
                      name={CustomizedFormField.lang}
                      options={getAvailableLanguages(selectedFormName)}
                      disableClearable={true}
                      renderInput={(params: AutocompleteRenderInputParams) => (
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
                  sx={{
                    display: 'flex',
                    marginRight: '0px',
                    marginLeft: 'auto',
                    margin: '10px',
                  }}
                  type="submit"
                  disabled={submitForm.isPending}>
                  Fetch Form
                </PrimaryButton>
              </Paper>
            </Form>
          )}
        </Formik>
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '150px',
          }}>
          <Typography variant="h6" color="textSecondary">
            No form templates available.
          </Typography>
        </Box>
      )}
    </>
  );
};
