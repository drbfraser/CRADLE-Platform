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
import { Box, Grid, Paper } from '@mui/material';
import TextField from '@mui/material/TextField';
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
  // const [errorMessage, setErrorMessage] = useState<string>('');
  const classes = useStyles();

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
        // errorMessage={errorMessage}
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
                  <Grid item sm={12} md={6} lg={4}>
                    <Field
                      label={'Title'}
                      component={TextField}
                      defaultValue={'Title'}
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
});
