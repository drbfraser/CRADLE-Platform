import React from 'react';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { Field } from 'formik';
import { CheckboxWithLabel, TextField } from 'formik-material-ui';
import { FormPageProps, ReadingField } from '../state';
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
        <React.Fragment key={field}>
          <Field
            component={CheckboxWithLabel}
            type="checkbox"
            name={field}
            Label={{ label }}
          />
          <br />
        </React.Fragment>
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
      </Box>
    </Paper>
  );
};
