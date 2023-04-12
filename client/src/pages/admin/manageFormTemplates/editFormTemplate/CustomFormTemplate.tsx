// import Box from '@mui/material/Box';
// import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { goBackWithFallback } from '../../../../shared/utils';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Typography from '@mui/material/Typography';
import APIErrorToast from '../../../../shared/components/apiErrorToast/APIErrorToast';
import { useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
// import { Grid } from '@mui/material';
// import {FormikProps} from "formik";
// import { CForm } from '../../../../shared/types';
// import { FormRenderStateEnum } from '../../../../shared/enums';
// import { TextField } from 'formik-mui';
import { Field, Form, Formik } from 'formik';
import {
  Box,
  Checkbox,
  FormControl,
  Grid,
  MenuItem,
  Paper,
} from '@mui/material';
import TextField from '@mui/material/TextField';

// import {Select} from "formik-mui";
import { languageOptions } from '../../../../shared/constants';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import ListItemText from '@mui/material/ListItemText';
import InputLabel from '@mui/material/InputLabel';
import AddIcon from '@mui/icons-material/Add';
import { PrimaryButton } from '../../../../shared/components/Button';
import { Check } from '@mui/icons-material';
import EditField from './EditField';
// import MenuItem from "@mui/material/MenuItem";
// import {languageOptions} from "../../../../shared/constants";
// import MenuItem from "@mui/material/MenuItem";
// import Select from "@mui/material/Select";
// import {fieldLabels, UserField} from "../../manageUsers/state";
// import {UserRoleEnum} from "../../../../shared/enums";
// import {handleChangeCustom} from "../../../patientForm/handlers";
// import {CustomForm} from "./CustomForm";
// import {Grid, TextField} from "@mui/material";
// import { Field, FormikProps } from 'formik';
// import {TextField} from "formik-mui";

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

export type FormState = typeof initialState;

export const CustomFormTemplate = () => {
  const [submitError, setSubmitError] = useState(false);
  const [language, setLanguage] = useState<string[]>([]);
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // const [errorMessage, setErrorMessage] = useState<string>('');
  const classes = useStyles();
  const handleChange = (event: SelectChangeEvent<typeof language>) => {
    const {
      target: { value },
    } = event;
    setLanguage(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value
    );
  };

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
      />
      <Formik
        initialValues={initialState}
        onSubmit={() => {
          console.log('Temp');
        }}
        validationSchema={() => {
          console.log('Temp');
        }}>
        {() => (
          <Form>
            <Paper>
              <Box p={4} pt={6} m={2}>
                <Grid container spacing={3}>
                  <h2>Custom Form Properties</h2>
                  {/*<Tooltip title="Select at least one language" placement="top">*/}
                  {/*<div>*/}
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
                  {/*</div>*/}

                  {/*</Tooltip>*/}

                  <PrimaryButton
                    className={classes.button}
                    disabled
                    onClick={() => {
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
                      // defaultValue={'Title'}
                      required={true}
                      variant="outlined"
                      fullWidth
                      multiline
                      inputProps={{
                        maxLength: Number.MAX_SAFE_INTEGER,
                      }}
                      onChange={(event: any) => {
                        //it is originally a string type!! need transfer
                      }}
                    />
                  </Grid>
                  <Grid item sm={12} md={6} lg={4}>
                    <Field
                      label={'Version'}
                      component={TextField}
                      // defaultValue={'1'}
                      required={true}
                      variant="outlined"
                      fullWidth
                      multiline
                      inputProps={{
                        maxLength: Number.MAX_SAFE_INTEGER,
                      }}
                      onChange={(event: any) => {
                        // temp
                      }}
                    />
                  </Grid>
                  <Grid item sm={12} md={6} lg={4}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Language *</InputLabel>
                      <Field
                        label={'Language'}
                        component={Select}
                        fullWidth
                        required={true}
                        multiple
                        multiline
                        variant="outlined"
                        onChange={handleChange}
                        value={language}
                        renderValue={(selected: any[]) => selected.join(', ')}>
                        {languageOptions.map((value) => (
                          <MenuItem key={value} value={value}>
                            {/*{value}*/}
                            <Checkbox checked={language.indexOf(value) > -1} />
                            <ListItemText primary={value} />
                          </MenuItem>
                        ))}
                      </Field>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Form>
        )}
      </Formik>
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
});
