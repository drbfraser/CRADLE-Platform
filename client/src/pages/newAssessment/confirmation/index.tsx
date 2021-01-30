import { TextField } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { FormPageProps, AssessmentField } from '../state';

export const Confirmation = ({ formikProps }: FormPageProps) => {
  const classes = useStyles();

  return (
    <Paper className={classes.container}>
      <Box p={2}>
        <h2>Confirmation</h2>
        <Grid container spacing={2}>
          <Grid item xs sm={6}>
            <TextField
              disabled
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              label="Investigation Results (if available)"
              value={formikProps.values[AssessmentField.investigation]}
            />
            <br />
            <br />
            <TextField
              disabled
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              label="Treatment / Operation"
              value={formikProps.values[AssessmentField.treatment]}
            />
            <br />
            <br />
            <TextField
              disabled
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              label="Instructions for Follow-Up"
              value={formikProps.values[AssessmentField.followUpInstruc]}
            />
          </Grid>
          <Grid item xs sm={6}>
            <TextField
              disabled
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              label="Final Diagnosis"
              value={formikProps.values[AssessmentField.finalDiagnosis]}
            />
            <br />
            <br />
            <TextField
              disabled
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              label="Medication Prescribed"
              value={formikProps.values[AssessmentField.medication]}
            />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

const useStyles = makeStyles({
  container: {
    '& h3': {
      color: '#777',
    },
    '& textarea, & input': {
      color: '#000',
    },
  },
});
