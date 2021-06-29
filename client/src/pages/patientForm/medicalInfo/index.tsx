import React from 'react';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { Field, FormikProps } from 'formik';
import { TextField } from 'formik-material-ui';
import { PatientField, PatientState } from '../state';

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
