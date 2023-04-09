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
import { Formik } from 'formik';
// import {PatientState} from "../../../patientForm/state";
// import {Grid, TextField} from "@mui/material";
// import { Field, FormikProps } from 'formik';
// import {TextField} from "formik-mui";

export const initialState = {};

export type FormState = typeof initialState;

// interface IProps {
//   formikProps: FormikProps<FormState>;
//   patientId: string;
//   fm: CForm;
//   renderState: FormRenderStateEnum;
// }

export const CustomFormPage = () => {
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

      <Formik
        initialValues={initialState}
        onSubmit={() => {
          console.log('Temp');
        }}
        validationSchema={() => {
          console.log('Temp');
        }}>
        <APIErrorToast
          open={submitError}
          onClose={() => setSubmitError(false)}
          // errorMessage={errorMessage}
        />
        {/*{(formikProps: FormikProps<PatientState>) => (*/}
        {/*    <Form>*/}
        {/*      <div className={classes.title}>*/}
        {/*        <Tooltip title="Go back" placement="top">*/}
        {/*          <IconButton*/}
        {/*              onClick={() => goBackWithFallback(`/admin/form-templates`)}*/}
        {/*              size="large">*/}
        {/*            <ChevronLeftIcon color="inherit" fontSize="large" />*/}
        {/*          </IconButton>*/}
        {/*        </Tooltip>*/}
        {/*        <Typography variant="h4">{'Create New Template'}</Typography>*/}
        {/*      </div>*/}

        {/*      <Paper>*/}
        {/*        <Box p={2}>*/}
        {/*          <Grid container spacing={2}>*/}
        {/*            <Grid item md={4} sm={12}>*/}
        {/*              <Field*/}
        {/*                  component={TextField}*/}
        {/*                  onChangeText={() => {*/}
        {/*                    console.log('temp');*/}
        {/*                  }}*/}
        {/*                  onBlur={() => {*/}
        {/*                    console.log('temp');*/}
        {/*                  }}*/}
        {/*                  // fullWidth*/}
        {/*              />*/}
        {/*              /!*        fullWidth*!/*/}
        {/*              /!*        required*!/*/}
        {/*              /!*        inputProps={{ maxLength: 50 }}*!/*/}
        {/*              /!*        variant="outlined"*!/*/}
        {/*              /!*        label="Title"*!/*/}
        {/*              /!*        name={"Title Name"}*!/*/}
        {/*              /!*        // onBlur={handlePatientIdBlur}*!/*/}
        {/*              /!*        // disabled={!creatingNew}*!/*/}
        {/*              /!*    /!*{existingPatientId && (*!/*!/*/}
        {/*              /!*    /!*    <PatientIDExists patientId={existingPatientId} />*!/*!/*/}
        {/*              /!*    /!*)}*!/*!/*/}
        {/*            </Grid>*/}
        {/*          </Grid>*/}
        {/*        </Box>*/}
        {/*      </Paper>*/}
        {/*    </Form>*/}
        {/*)}*/}
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
