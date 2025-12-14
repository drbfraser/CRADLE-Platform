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

import { FormTemplateWithQuestionsV2 } from 'src/shared/types/form/formTemplateTypes';
import { FormRenderStateEnum } from 'src/shared/enums';
import { CustomizedFormWQuestions } from 'src/pages/customizedForm/components/CustomizedFormWQuestions';
import {
  useFormTemplateQuery,
  useFormTemplateQueryV2,
  usePreviousFormVersionsQuery,
  usePreviousFormVersionsQueryV2,
} from 'src/pages/customizedForm/queries';
import LanguageModal from './LanguageModal';
import { getDefaultLanguage } from './utils';
import { capitalize } from 'src/shared/utils';
import { useFormTemplatesQueryV2 } from 'src/shared/queries';

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

  const [form, setForm] = useState<FormTemplateWithQuestionsV2>({
    classification: {
      name: {
        english: 'Template',
      },
      id: undefined,
      nameStringId: undefined,
    },
    version: generateDefaultVersion(),
    questions: [],
    id: 'temp',
  });
  const [versionError, setVersionError] = useState<boolean>(false);
  const browserLanguage = getDefaultLanguage() ?? 'English';
  const [language, setLanguage] = useState<string[]>([browserLanguage]);
  const [currentLanguage, setCurrentLanguage] =
    useState<string>(browserLanguage);

  const formTemplateQuery = useFormTemplateQueryV2(editFormId);
  const previousVersionsQuery = usePreviousFormVersionsQueryV2(
    formTemplateQuery.data
  );

  useEffect(() => {
    if (formTemplateQuery.data) {
      const { id, classification, questions, version } = formTemplateQuery.data;

      setForm({
        id,
        classification,
        version: version.toString(),
        questions,
      });

      const langs = questions[0]?.questionText
        ? Object.keys(questions[0].questionText)
        : [browserLanguage];

      setLanguage(langs);
    }
  }, [formTemplateQuery.data]);

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
                      value={
                        form.classification.name[
                          currentLanguage.toLowerCase()
                        ] ?? ''
                      }
                      fullWidth
                      inputProps={{
                        maxLength: 100,
                      }}
                      error={
                        !form.classification.name[
                          currentLanguage.toLowerCase()
                        ] ||
                        form.classification.name[
                          currentLanguage.toLowerCase()
                        ].trim() === ''
                      }
                      helperText={
                        !form.classification.name[
                          currentLanguage.toLowerCase()
                        ] ||
                        form.classification.name[
                          currentLanguage.toLowerCase()
                        ].trim() === ''
                          ? `${currentLanguage} title is required`
                          : ''
                      }
                      onChange={(e: any) => {
                        const isEnglishLanguage =
                          currentLanguage.toLowerCase() === 'english';

                        setForm((prev) => ({
                          ...prev,
                          classification: {
                            ...prev.classification,
                            // Only clear IDs if English name is being changed - so that backend can check for name conflicts and create a new classification
                            id: isEnglishLanguage
                              ? undefined
                              : prev.classification.id,
                            name: {
                              ...prev.classification.name,
                              [currentLanguage.toLowerCase()]: e.target.value,
                            },
                            nameStringId: isEnglishLanguage
                              ? undefined
                              : prev.classification.nameStringId,
                          },
                          // Only clear form ID if English name is being changed
                          id: isEnglishLanguage ? undefined : prev.id,
                        }));
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
                      value={form.version}
                      error={versionError}
                      helperText={
                        versionError ? 'Must change version number' : ''
                      }
                      fullWidth
                      inputProps={{
                        maxLength: 30,
                      }}
                      onChange={(e: any) => {
                        setForm({
                          ...form,
                          version: e.target.value,
                        });
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
                setCurrentLanguage={setCurrentLanguage}
              />
            </Form>
          )}
        </Formik>
      )}
    </>
  );
};
