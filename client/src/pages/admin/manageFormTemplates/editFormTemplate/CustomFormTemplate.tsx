import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Field, Form, Formik } from 'formik';
import {
  Box,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import moment from 'moment';

import { FormTemplateWithQuestions } from 'src/shared/types';
import { FormRenderStateEnum } from 'src/shared/enums';
import { CustomizedFormWQuestions } from 'src/pages/customizedForm/components/CustomizedFormWQuestions';
import {
  getFormClassificationTemplates,
  getFormTemplateAsync,
} from 'src/shared/api/api';
import { getDefaultLanguage } from './utils';
import LanguageModal from './LanguageModal';
import { useQuery } from '@tanstack/react-query';

export enum FormEditMainComponents {
  title = 'title',
  version = 'version',
  languages = 'languages',
}

export const initialState = {
  [FormEditMainComponents.title]: '',
  [FormEditMainComponents.version]: '1',
  [FormEditMainComponents.languages]: '',
};

export const CustomFormTemplate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editFormId = location.state?.editFormId as string | undefined;

  const defaultVersion: string = moment
    .utc(new Date(Date.now()).toUTCString())
    .format('YYYY-MM-DD HH:mm:ss z');

  const [form, setForm] = useState<FormTemplateWithQuestions>({
    classification: { name: 'string', id: undefined },
    version: defaultVersion,
    questions: [],
  });
  const [versionError, setVersionError] = useState<boolean>(false);

  const formTemplateQuery = useQuery({
    queryKey: ['formTemplate', editFormId],
    queryFn: () => getFormTemplateAsync(editFormId!),
    enabled: !!editFormId,
  });

  const previousVersionsQuery = useQuery({
    queryKey: ['formVersions', formTemplateQuery.data?.classification.id],
    queryFn: async () => {
      if (formTemplateQuery.data?.classification?.id) {
        const previousTemplates = await getFormClassificationTemplates(
          formTemplateQuery.data.classification.id
        );
        return previousTemplates.map((template) => template.version);
      }
      return [];
    },
    enabled: !!formTemplateQuery.data,
  });

  useEffect(() => {
    if (formTemplateQuery.data) {
      const { classification, version, questions } = formTemplateQuery.data;
      setForm({ classification, version, questions });
      setVersionError(true);
    }
  }, [formTemplateQuery.data]);

  const browserLanguage = getDefaultLanguage() ?? 'English';
  const [language, setLanguage] = useState<string[]>(
    formTemplateQuery.data?.questions[0].langVersions?.map((q) => q.lang) ?? [
      browserLanguage,
    ]
  );

  return (
    <>
      <Box sx={{ display: `flex`, alignItems: `center` }}>
        <Tooltip title="Go back" placement="top">
          <IconButton
            onClick={() => navigate(`/admin/form-templates`)}
            size="large">
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        {/*TODO: Allow template name to change depending on if we are editing a new or existing form template*/}
        <Typography variant={'h4'} component={'h4'}>
          {editFormId ? 'Edit Template' : 'Create New Template'}
        </Typography>
      </Box>

      <Formik
        initialValues={initialState}
        onSubmit={() => {
          // TODO: Handle Form Template create/edit form submission
          console.log('Temp');
        }}
        validationSchema={() => {
          // TODO: Create a validation schema to ensure that all the values are filled in as expected
          console.log('Temp');
        }}>
        {() => (
          <Form>
            <Paper sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <h2>Custom Form Properties</h2>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Field
                    label={'Title'}
                    component={TextField}
                    required={true}
                    variant="outlined"
                    defaultValue={
                      formTemplateQuery.data?.classification?.name ?? ''
                    }
                    fullWidth
                    inputProps={{
                      // TODO: Determine what types of input restrictions we should have for title
                      maxLength: Number.MAX_SAFE_INTEGER,
                    }}
                    onChange={(e: any) => {
                      form.classification.name = e.target.value;
                    }}
                    InputProps={{
                      endAdornment: (
                        <Tooltip
                          disableFocusListener
                          disableTouchListener
                          title={'Enter your form title here'}
                          arrow>
                          <InputAdornment position="end">
                            <IconButton>
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        </Tooltip>
                      ),
                    }}></Field>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Field
                    label={'Version'}
                    component={TextField}
                    required={true}
                    variant="outlined"
                    defaultValue={
                      formTemplateQuery.data
                        ? formTemplateQuery.data.version
                        : defaultVersion
                    }
                    error={versionError}
                    helperText={
                      versionError ? 'Must change version number' : ''
                    }
                    fullWidth
                    inputProps={{
                      // TODO: Determine what types of input restrictions we should have for version
                      maxLength: Number.MAX_SAFE_INTEGER,
                    }}
                    onChange={(e: any) => {
                      form.version = e.target.value;
                      setVersionError(
                        previousVersionsQuery.data?.includes(form.version) ??
                          false
                      );
                    }}
                    InputProps={{
                      endAdornment: (
                        <Tooltip
                          disableFocusListener
                          disableTouchListener
                          title={
                            editFormId
                              ? 'Edit your form Version here'
                              : 'Edit your form Version here. By default, Version is set to the current DateTime but can be edited'
                          }
                          arrow>
                          <InputAdornment position="end">
                            <IconButton>
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        </Tooltip>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <LanguageModal
                    language={language}
                    setLanguage={setLanguage}
                  />
                </Grid>
              </Grid>
            </Paper>

            <CustomizedFormWQuestions
              fm={form}
              languages={language}
              renderState={FormRenderStateEnum.SUBMIT_TEMPLATE}
              setForm={setForm}
              versionError={versionError}
            />
          </Form>
        )}
      </Formik>
    </>
  );
};
