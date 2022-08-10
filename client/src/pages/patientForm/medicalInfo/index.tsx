import { Field, FormikProps } from 'formik';
import { PatientField, PatientState } from '../state';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import React from 'react';
import { TextField } from 'formik-mui';

interface IProps {
  formikProps: FormikProps<PatientState>;
  creatingNew: boolean;
  isDrugRecord?: boolean;
}

export const MedicalInfoForm = ({
  formikProps,
  creatingNew,
  isDrugRecord,
}: IProps) => {
  return (
    <Paper>
      <Box p={2}>
        <Grid container spacing={2}>
          {(creatingNew || (!creatingNew && !isDrugRecord!)) && (
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
          )}
          {(creatingNew || (!creatingNew && isDrugRecord!)) && (
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
          )}
        </Grid>
      </Box>
    </Paper>
  );
};
