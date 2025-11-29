import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Field, Form, Formik } from 'formik';
import {
  Box,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import moment from 'moment';

import { FormTemplateWithQuestions } from 'src/shared/types/form/formTemplateTypes';
import { FormRenderStateEnum } from 'src/shared/enums';
import { CustomizedFormWQuestions } from 'src/pages/customizedForm/components/CustomizedFormWQuestions';
import {
  useFormTemplateQuery,
  usePreviousFormVersionsQuery,
} from 'src/pages/customizedForm/queries';
import LanguageModal from './LanguageModal';
import { getDefaultLanguage } from './utils';
import { capitalize } from 'src/shared/utils';

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

  const generateDefaultVersion = () => {
    return moment
      .utc(new Date(Date.now()).toUTCString())
      .format('YYYY-MM-DD HH:mm:ss z');
  };

  const [form, setForm] = useState<FormTemplateWithQuestions>({
    classification: {
      name: {
        english: 'Template',
      },
      id: undefined,
      nameStringId: undefined,
    },
    version: generateDefaultVersion(),
    questions: [],
  });
  const [versionError, setVersionError] = useState<boolean>(false);

  const formTemplateQuery = useFormTemplateQuery(editFormId);
  const previousVersionsQuery = usePreviousFormVersionsQuery(
    formTemplateQuery.data
  );

  useEffect(() => {
    if (formTemplateQuery.data) {
      const { classification, questions, version } = formTemplateQuery.data;

      setForm({
        classification,
        version,
        questions,
      });

      const langs = questions[0]?.questionText
        ? Object.keys(questions[0].questionText)
        : [browserLanguage];

      setLanguage(langs);
    }
  }, [formTemplateQuery.data]);

  const browserLanguage = getDefaultLanguage() ?? 'English';
  const [language, setLanguage] = useState<string[]>([browserLanguage]);

  const isLoading =
    editFormId &&
    formTemplateQuery.isPending &&
    previousVersionsQuery.isPending;

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
        <Typography variant={'h4'} component={'h4'}>
          {editFormId
            ? `Editing Form: ${form.classification.name.english || 'Template'}`
            : 'Create New Template'}
        </Typography>
      </Box>

      {isLoading ? (
        <Skeleton variant="rectangular" height={400} />
      ) : (
        <Formik
          initialValues={initialState}
          onSubmit={() => {
            /* form creation/editing handled inside `SubmitFormTemplateDialog` */
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
                        formTemplateQuery.data?.classification?.name.english ??
                        ''
                      }
                      fullWidth
                      inputProps={{
                        // TODO: Determine what types of input restrictions we should have for title
                        maxLength: 100,
                      }}
                      onChange={(e: any) => {
                        setForm(() => ({} as any));
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
                      defaultValue={form.version}
                      error={versionError}
                      helperText={
                        versionError ? 'Must change version number' : ''
                      }
                      fullWidth
                      inputProps={{
                        maxLength: 30,
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
                      language={language.map((lang) => capitalize(lang))}
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
      )}
    </>
  );
};
