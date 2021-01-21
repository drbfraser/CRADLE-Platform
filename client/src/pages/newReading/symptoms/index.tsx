import React from 'react';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { Field } from 'formik';
import { CheckboxWithLabel, TextField } from 'formik-material-ui';
import { FormPageProps, ReadingField } from '../state';
import { symptomNames } from './symptoms';

const symptomsLen = Object.keys(symptomNames).length;
const symptomsLenHalf = Math.floor(symptomsLen / 2);
const checkboxesCol1 = Object.entries(symptomNames).slice(0, symptomsLenHalf);
const checkboxesCol2 = Object.entries(symptomNames).slice(
  symptomsLenHalf,
  symptomsLen
);

export const Symptoms = ({ formikProps }: FormPageProps) => {
  return (
    <Paper>
      <Box p={2}>
        <h2>Symptoms</h2>
        <Grid container>
          <Grid item md={3}>
            {checkboxesCol1.map(([field, label]) => (
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
          </Grid>
          <Grid item md={3}>
            {checkboxesCol2.map(([field, label]) => (
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
