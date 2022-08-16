import { CheckboxWithLabel, TextField } from 'formik-mui';
import { FormPageProps, ReadingField } from '../state';

import Box from '@mui/material/Box';
import { Field } from 'formik';
import { Fragment } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { Typography } from '@mui/material';
import { symptomNames } from './symptoms';

interface ICheckboxCol {
  symptoms: [string, string][];
}

const symptomsLen = Object.keys(symptomNames).length;
const symptomsLenHalf = Math.floor(symptomsLen / 2);
const symptomsCol1 = Object.entries(symptomNames).slice(0, symptomsLenHalf);
const symptomsCol2 = Object.entries(symptomNames).slice(
  symptomsLenHalf,
  symptomsLen
);

export const Symptoms = ({ formikProps }: FormPageProps) => {
  const CheckboxColumn = ({ symptoms }: ICheckboxCol) => (
    <>
      {symptoms.map(([field, label]: [string, string]) => (
        <Fragment key={field}>
          <Field
            component={CheckboxWithLabel}
            type="checkbox"
            name={field}
            Label={{ label }}
          />
          <br />
        </Fragment>
      ))}
    </>
  );

  return (
    <Paper>
      <Box p={2}>
        <h2>Symptoms</h2>
        <Grid container>
          <Grid item md={3}>
            <CheckboxColumn symptoms={symptomsCol1} />
          </Grid>
          <Grid item md={3}>
            <CheckboxColumn symptoms={symptomsCol2} />
          </Grid>
          <Grid item md={6}>
            <Field
              component={TextField}
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              name={ReadingField.otherSymptoms}
              label="Other symptoms"
            />
          </Grid>
        </Grid>
        <br />
        <Typography color="textSecondary" variant="caption">
          If the patient has no symptoms, click next.
        </Typography>
      </Box>
    </Paper>
  );
};
