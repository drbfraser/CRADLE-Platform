import { FormTemplateWithQuestions } from 'src/shared/types';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import { getLanguages, goBackWithFallback } from '../../../../shared/utils';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Typography from '@mui/material/Typography';
import APIErrorToast from '../../../../shared/components/apiErrorToast/APIErrorToast';
import React, { useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { Field, Form, Formik } from 'formik';
import {
  Box,
  Checkbox,
  FormControl,
  Grid,
  InputAdornment,
  Paper,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { PrimaryButton } from '../../../../shared/components/Button';
import { FormRenderStateEnum } from 'src/shared/enums';
import { LanguageModalProps } from 'src/shared/types';
import { useLocation } from 'react-router-dom';
import { CustomizedFormWQuestions } from 'src/pages/customizedForm/customizedEditForm/CustomizedFormWQuestions';
import { getFormClassificationTemplates } from 'src/shared/api';
import moment from 'moment';

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

//Convert language code to language name
export const getLanguageName = (langCode: any): string => {
  const language: string =
    new Intl.DisplayNames(['en'], { type: 'language' }).of(langCode) ||
    'English';
  return language;
};

//Check if returned browser language name is part of built in languages
export const getDefaultLanguage = () => {
  const browserLanguage: string = getLanguageName(
    navigator.language || window.navigator.language
  );
  const languageOptions = getLanguages();
  let defaultLang = languageOptions[0];
  languageOptions.forEach((languageOption) => {
    const language = languageOption === undefined ? '' : languageOption;
    if (browserLanguage.includes(language)) {
      defaultLang = language;
    }
  });
  return defaultLang;
};

export const CustomFormTemplate = () => {
  const location = useLocation<FormTemplateWithQuestions>();
  const targetFrom = location.state;
  const [submitError, setSubmitError] = useState(false);
  const browserLanguage =
    getDefaultLanguage() === undefined ? 'English' : getDefaultLanguage();
  const [language, setLanguage] = useState<string[]>(
    targetFrom?.questions[0].questionLangVersions.map((q) => q.lang) ?? [
      browserLanguage,
    ]
  );

  const defaultVersion: string = moment
    .utc(new Date(Date.now()).toUTCString())
    .format('YYYY-MM-DD HH:mm:ss z');

  const [form, setForm] = useState<FormTemplateWithQuestions>(
    targetFrom
      ? {
          classification: targetFrom.classification,
          version: targetFrom.version,
          questions: targetFrom.questions,
        }
      : {
          classification: { name: 'string', id: undefined },
          version: defaultVersion,
          questions: [],
        }
  );

  const [versionError, setVersionError] = useState<boolean>(
    targetFrom ? true : false
  );

  const classes = useStyles();

  const getFormVersions = async (formClassificationId: string) => {
    const formTemplates = await getFormClassificationTemplates(
      formClassificationId
    );
    return formTemplates.map((form: FormTemplateWithQuestions) => form.version);
  };

  let previousVersions: string[] = [];
  (async () => {
    if (targetFrom?.classification?.id) {
      previousVersions = await getFormVersions(targetFrom.classification.id);
    }
  })();

  return (
    <>
      <div className={classes.title}>
        <Tooltip title="Go back" placement="top">
          <IconButton
            onClick={() => goBackWithFallback(`/admin/form-templates`)}
            size="large">
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        {/*TODO: Allow template name to change depending on if we are editing a new or existing form template*/}
        <Typography variant="h4">
          {targetFrom ? 'Edit Template' : 'Create New Template'}
        </Typography>
      </div>
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
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
            <Paper>
              <Box p={4} pt={6} m={2}>
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
                      defaultValue={targetFrom?.classification?.name ?? ''}
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
                        targetFrom ? targetFrom.version : defaultVersion
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
                          previousVersions.includes(form.version)
                        );
                      }}
                      InputProps={{
                        endAdornment: (
                          <Tooltip
                            disableFocusListener
                            disableTouchListener
                            title={
                              targetFrom
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
              </Box>
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

const LanguageModal = ({ language, setLanguage }: LanguageModalProps) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showLanguageWarning, setShowLanguageWarning] =
    useState<boolean>(false);
  const languageOptions = getLanguages();

  const classes = useStyles();

  // handles the change of the multi-select language
  const handleLanguageChange = (
    target: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.checked) {
      setLanguage((prevState) => {
        return [...prevState, target];
      });
    } else {
      setLanguage((prevState) => {
        const newLanguage = prevState.filter((language) => language !== target);
        // making sure at least one language is selected
        if (newLanguage.length === 0) {
          setShowLanguageWarning(true);
          return prevState;
        } else {
          return [...newLanguage];
        }
      });
    }
  };

  return (
    <>
      <TextField
        aria-readonly
        label={'Language'}
        fullWidth
        required={true}
        focused={showModal}
        multiline
        variant="outlined"
        value={language.join(', ')}
        onClick={() => setShowModal(true)}
        InputProps={{
          endAdornment: (
            <Tooltip
              disableFocusListener
              disableTouchListener
              title={'Select your form languages here'}
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
      <Dialog
        fullWidth
        maxWidth={'md'}
        onClose={() => setShowModal(false)}
        open={showModal}>
        <DialogTitle>Language *</DialogTitle>
        <DialogContent dividers={true}>
          <FormControl fullWidth variant="outlined">
            <FormGroup>
              <Grid container spacing={1} className={classes.modal}>
                {languageOptions.map((value) => {
                  if (value === undefined) {
                    return <></>;
                  }
                  return (
                    <Grid item key={value} xs={4}>
                      <FormControlLabel
                        label={value}
                        control={
                          <Checkbox
                            onChange={(
                              event: React.ChangeEvent<HTMLInputElement>
                            ) => handleLanguageChange(value, event)}
                            checked={language.indexOf(value) > -1}
                          />
                        }
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </FormGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <PrimaryButton
            className={classes.button}
            onClick={() => setShowModal(false)}>
            Close
          </PrimaryButton>
        </DialogActions>
      </Dialog>
      <Dialog
        onClose={() => setShowLanguageWarning(false)}
        open={showLanguageWarning}>
        <DialogTitle>Must have at least one language</DialogTitle>
        <DialogContent>
          <Typography>
            You must select at least one language for this form.
          </Typography>
        </DialogContent>
        <DialogActions>
          <PrimaryButton
            className={classes.button}
            onClick={() => setShowLanguageWarning(false)}>
            OK
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

const useStyles = makeStyles({
  container: {
    maxWidth: 1250,
    margin: '0 auto',
  },
  title: {
    display: `flex`,
    alignItems: `center`,
  },
  right: {
    float: 'right',
    margin: 5,
  },
  button: {
    height: '100%',
    marginLeft: 10,
  },
  modal: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
});
