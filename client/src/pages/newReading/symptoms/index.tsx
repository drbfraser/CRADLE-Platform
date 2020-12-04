import React from 'react';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import { Field } from 'formik';
import { CheckboxWithLabel } from 'formik-material-ui';
import { ReadingField } from '../state';

const checkboxesCol1 = {
  [ReadingField.headache]: 'Headache',
  [ReadingField.blurredVision]: 'Blurred vision',
  [ReadingField.abdominalPain]: 'Abdominal pain',
  [ReadingField.bleeding]: 'Bleeding',
  [ReadingField.feverish]: 'Feverish',
  [ReadingField.unwell]: 'Unwell',
  [ReadingField.fatigue]: 'Fatigue',
}

const checkboxesCol2 = {
  [ReadingField.cough]: 'Cough',
  [ReadingField.shortnessOfBreath]: 'Shortness of breath',
  [ReadingField.soreThroat]: 'Sore throat',
  [ReadingField.muscleAche]: 'Muscle ache',
  [ReadingField.lossOfSense]: 'Loss of sense',
  [ReadingField.lossOfTaste]: 'Loss of taste',
  [ReadingField.lossOfSmell]: 'Loss of smell',
}

export const Symptoms = () => {
  return (
    <Paper>
      <Box p={2}>
        <h2>Symptoms</h2>
        <Grid container>
          <Grid item md={3}>
          {
            Object.entries(checkboxesCol1).map(([name, label]) => (
              <>
                <Field
                  component={CheckboxWithLabel}
                  type="checkbox"
                  name={name}
                  Label={{ label }}
                />
                <br/>
              </>
            ))
          }
          </Grid>
          <Grid item md={3}>
          {
            Object.entries(checkboxesCol2).map(([name, label]) => (
              <>
                <Field
                  component={CheckboxWithLabel}
                  type="checkbox"
                  name={name}
                  Label={{ label }}
                />
                <br/>
              </>
            ))
          }
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
  )
};
