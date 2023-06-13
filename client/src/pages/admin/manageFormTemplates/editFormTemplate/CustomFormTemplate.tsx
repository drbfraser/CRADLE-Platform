import { CForm } from 'src/shared/types';
import { CustomizedForm } from '../../../customizedForm/customizedEditForm/CustomizedForm';

import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { getLanguages, goBackWithFallback } from '../../../../shared/utils';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Typography from '@mui/material/Typography';
import APIErrorToast from '../../../../shared/components/apiErrorToast/APIErrorToast';
import React, { useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { Field, Form, Formik } from 'formik';
import { Box, Checkbox, FormControl, Grid, Paper } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import AddIcon from '@mui/icons-material/Add';
import { PrimaryButton } from '../../../../shared/components/Button';
import { Check } from '@mui/icons-material';
import EditField from './EditField';
import { FormRenderStateEnum } from 'src/shared/enums';
import { LanguageModalProps } from 'src/shared/types';
import { FormTemplate } from 'src/shared/types';
import { useLocation } from 'react-router-dom';

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
  const [submitError, setSubmitError] = useState(false);
  const [language, setLanguage] = useState<string[]>([]);
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const classes = useStyles();

  const location = useLocation<FormTemplate>();
  const targetFrom = location.state;

  const [form, setForm] = useState<CForm>({
    dateCreated: 0,
    id: undefined,
    version: undefined,
    patientId: undefined,
    category: 'string',
    lastEdited: 0,
    name: 'string',
    lang: 'string',
    questions: [],
  });

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
        <Typography variant="h4">{'Create New Template'}</Typography>
      </div>
      <APIErrorToast
        open={submitError}
        onClose={() => setSubmitError(false)}
        errorMessage={errorMessage}
      />
      <EditField
        open={editPopupOpen}
        onClose={() => {
          setEditPopupOpen(false);
        }}
        inputLanguages={language}
        setForm={setForm}
        form={form}
      />
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
                  <h2>Custom Form Properties</h2>
                  <PrimaryButton
                    className={classes.button}
                    // disabled={language.length == 0}
                    onClick={() => {
                      if (language.length != 0) {
                        setEditPopupOpen(true);
                      } else {
                        setSubmitError(true);
                        setErrorMessage(
                          'Select at least one language before creating a field'
                        );
                      }
                    }}>
                    <AddIcon />
                    {'Create New Field'}
                  </PrimaryButton>

                  <PrimaryButton
                    className={classes.button}
                    disabled
                    onClick={() => {
                      // TODO: Make submit button have the ability to submit the form
                      console.log('Submit button clicked');
                    }}>
                    <Check />
                    {'Submit Form Template'}
                  </PrimaryButton>
                </Grid>
                <Grid container spacing={3}>
                  <Grid item sm={12} md={6} lg={4}>
                    <Field
                      label={'Title'}
                      component={TextField}
                      required={true}
                      variant="outlined"
                      defaultValue={targetFrom ? targetFrom.id : ''}
                      fullWidth
                      multiline
                      inputProps={{
                        // TODO: Determine what types of input restrictions we should have for title
                        maxLength: Number.MAX_SAFE_INTEGER,
                      }}
                    />
                  </Grid>
                  <Grid item sm={12} md={6} lg={4}>
                    <Field
                      label={'Version'}
                      component={TextField}
                      required={true}
                      variant="outlined"
                      defaultValue={targetFrom ? targetFrom.version : ''}
                      fullWidth
                      multiline
                      inputProps={{
                        // TODO: Determine what types of input restrictions we should have for version
                        maxLength: Number.MAX_SAFE_INTEGER,
                      }}
                    />
                  </Grid>
                  <Grid item sm={12} md={6} lg={4}>
                    <LanguageModal
                      language={language}
                      setLanguage={setLanguage}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Paper>
            {form && form.questions && form!.questions!.length > 0 && (
              <CustomizedForm
                patientId={''}
                fm={form}
                renderState={FormRenderStateEnum.FINISH}
              />
            )}
          </Form>
        )}
      </Formik>
    </>
  );
};

const LanguageModal = ({ language, setLanguage }: LanguageModalProps) => {
  const [showModal, setShowModal] = useState<boolean>(false);
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
        return [...newLanguage];
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
              <Grid container spacing={3} className={classes.modal}>
                {languageOptions.map((value) => {
                  if (value === undefined) {
                    return <></>;
                  }
                  return (
                    <Grid key={value} xs={4}>
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
