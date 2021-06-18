import React from 'react';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import { FormPageProps, PatientField } from '../state';

export const MedicalInfoForm = ({ formikProps }: FormPageProps) => {
  return (
    <Paper>
      <Box p={2}>
        <h2>Medical Information</h2>
        <Grid container spacing={2}>
          <Grid item md={6} sm={12}>
            <Field
              component={TextField}
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              name={PatientField.medicalHistory}
              label="Medical History"
            />
          </Grid>
          <Grid item md={6} sm={12}>
            <Field
              component={TextField}
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              name={PatientField.drugHistory}
              label="Drug History"
            />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};
