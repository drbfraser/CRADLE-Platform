import { TextField } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { FormPageProps, ReadingField } from '../state';

export const Confirmation = ({formikProps}: FormPageProps) => {
  const classes = useStyles();

  return (
    <Paper className={classes.container}>
      <Box p={2}>
        <h2>Confirmation</h2>
        <h3>Symptoms</h3>
        <Grid container spacing={2}>
          <Grid item xs sm={6}>
            <TextField
              label="Symptoms"
              value="SYMPTOMS"
              multiline
              fullWidth
              variant="outlined"
              rows={3}
              disabled
            />
          </Grid>
          <Grid item xs sm={6}>
            <TextField
              disabled
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              label="Other Symptoms"
              value={formikProps.values[ReadingField.otherSymptoms]}
            />
          </Grid>
        </Grid>
        <br/><br/>
        <Grid container spacing={2}>
          <Grid item xs sm={6}>
            <h3>Vitals</h3>
            <TextField
              disabled
              fullWidth
              variant="outlined"
              label="Systolic"
              value={formikProps.values[ReadingField.bpSystolic]}
            />
            <br/><br/>
            <TextField
              disabled
              fullWidth
              variant="outlined"
              label="Diastolic"
              value={formikProps.values[ReadingField.bpDiastolic]}
            />
            <br/><br/>
            <TextField
              disabled
              fullWidth
              variant="outlined"
              label="Heart Rate"
              value={formikProps.values[ReadingField.heartRateBPM]}
            />
            <br/><br/>
            <TextField
              disabled
              fullWidth
              variant="outlined"
              label="Respiratory Rate"
              value={formikProps.values[ReadingField.respiratoryRate]}
            />
            <br/><br/>
            <TextField
              disabled
              fullWidth
              variant="outlined"
              label="Oxygen Saturation"
              value={formikProps.values[ReadingField.oxygenSaturation]}
            />
            <br/><br/>
            <TextField
              disabled
              fullWidth
              variant="outlined"
              label="Temperature"
              value={formikProps.values[ReadingField.temperature]}
            />
          </Grid>
          <br/><br/>
          <Grid item xs sm={6}>
            <h3>Urine Test</h3>
            <TextField
              disabled
              fullWidth
              variant="outlined"
              label="Leukocytes"
              value={formikProps.values[ReadingField.leukocytes]}
            />
            <br/><br/>
            <TextField
              disabled
              fullWidth
              variant="outlined"
              label="Nitrites"
              value={formikProps.values[ReadingField.nitrites]}
            />
            <br/><br/>
            <TextField
              disabled
              fullWidth
              variant="outlined"
              label="Glucose"
              value={formikProps.values[ReadingField.glucose]}
            />
            <br/><br/>
            <TextField
              disabled
              fullWidth
              variant="outlined"
              label="Protein"
              value={formikProps.values[ReadingField.protein]}
            />
            <br/><br/>
            <TextField
              disabled
              fullWidth
              variant="outlined"
              label="Blood"
              value={formikProps.values[ReadingField.blood]}
            />
            <br/><br/>
          </Grid>
        </Grid>
        <h3>Assessment</h3>
        <Grid container spacing={2}>
          <Grid item xs sm={6}>
            <TextField
              disabled
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              label="Special Investigations"
              value={formikProps.values[ReadingField.investigation]}
            />
            <br/><br/>
            <TextField
              disabled
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              label="Treatment / Operation"
              value={formikProps.values[ReadingField.treatment]}
            />
            <br/><br/>
            <TextField
              disabled
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              label="Instructions for Follow-Up"
              value={formikProps.values[ReadingField.followUpInstruc]}
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
              value={formikProps.values[ReadingField.finalDiagnosis]}
            />
            <br/><br/>
            <TextField
              disabled
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              label="Medication Prescribed"
              value={formikProps.values[ReadingField.medication]}
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