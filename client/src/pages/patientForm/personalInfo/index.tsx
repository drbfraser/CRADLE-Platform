import React, { useState } from 'react';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { Field, FormikProps } from 'formik';
import { PatientField, PatientState } from '../state';
import { Select, TextField } from 'formik-material-ui';
import { ToggleButtonGroup } from 'formik-material-ui-lab';
import ToggleButton from '@material-ui/lab/ToggleButton';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import { PatientIDExists } from './PatientIDExists';
import { handleBlurPatientId } from './handlers';
import { handleChangeCustom } from '../handlers';
import { sexOptions } from 'src/shared/constants';

interface IProps {
  formikProps: FormikProps<PatientState>;
  creatingNew: boolean;
}

export const PersonalInfoForm = ({ formikProps, creatingNew }: IProps) => {
  const classes = useStyles();
  // for *new* patients only, track whether the patient ID already exists
  const [existingPatientId, setExistingPatientId] =
    useState<string | null>(null);
  return (
    <Paper>
      <Box p={2}>
        {creatingNew && <h2>Personal Information</h2>}
        <Grid container spacing={2}>
          <Grid item md={4} sm={12}>
            <Field
              component={TextField}
              fullWidth
              required
              inputProps={{ maxLength: 50 }}
              variant="outlined"
              label="Patient ID"
              name={PatientField.patientId}
              onBlur={handleBlurPatientId(
                formikProps.handleBlur,
                setExistingPatientId
              )}
              disabled={!creatingNew}
            />
            {existingPatientId != null && (
              <PatientIDExists patientId={existingPatientId} />
            )}
          </Grid>
          <Grid item md={4} sm={12}>
            <Field
              component={TextField}
              fullWidth
              required
              inputProps={{ maxLength: 50 }}
              variant="outlined"
              label="Patient Name"
              name={PatientField.patientName}
            />
          </Grid>
          <Grid item md={4} sm={12}>
            <Field
              component={TextField}
              fullWidth
              inputProps={{ maxLength: 50 }}
              variant="outlined"
              label="Household Number"
              name={PatientField.householdNumber}
            />
          </Grid>
          <Grid item md={4} sm={12}>
            <Field
              component={ToggleButtonGroup}
              exclusive
              size="large"
              type="checkbox"
              value={Boolean(formikProps.values.isExactDob)}
              name={PatientField.isExactDob}>
              <ToggleButton classes={{ selected: classes.toggle }} value={true}>
                Date of Birth
              </ToggleButton>
              <ToggleButton
                classes={{ selected: classes.toggle }}
                value={false}>
                Estimated Age
              </ToggleButton>
            </Field>
          </Grid>
          <Grid item md={4} sm={12}>
            {formikProps.values.isExactDob ? (
              <Field
                component={TextField}
                fullWidth
                required
                variant="outlined"
                type="date"
                label="Date of Birth"
                name={PatientField.dob}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            ) : (
              <Field
                component={TextField}
                fullWidth
                required
                variant="outlined"
                type="number"
                label="Patient Age"
                name={PatientField.estimatedAge}
              />
            )}
          </Grid>
          <Grid item md={2} sm={12}>
            <Field
              component={TextField}
              fullWidth
              inputProps={{ maxLength: 20 }}
              variant="outlined"
              label="Zone"
              name={PatientField.zone}
            />
          </Grid>
          <Grid item md={2} sm={12}>
            <Field
              component={TextField}
              fullWidth
              inputProps={{ maxLength: 50 }}
              variant="outlined"
              label="Village"
              name={PatientField.villageNumber}
            />
          </Grid>
          <Grid item md={4} sm={12} xs={12}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Gender</InputLabel>
              <Field
                component={Select}
                fullWidth
                label="Gender"
                name={PatientField.patientSex}
                onChange={handleChangeCustom(
                  formikProps.handleChange,
                  formikProps.setFieldValue
                )}>
                {Object.entries(sexOptions).map(([value, name]) => (
                  <MenuItem key={value} value={value}>
                    {name}
                  </MenuItem>
                ))}
              </Field>
            </FormControl>
          </Grid>
          <Grid item md={6} sm={12}>
            <Field
              component={TextField}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              label="Allergies"
              name={PatientField.allergy}
            />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

const useStyles = makeStyles({
  toggle: {
    border: '1px solid #3f51b5 !important',
    fontWeight: 'bold',
    color: '#3f51b5 !important',
  },
  right: {
    float: 'right',
  },
  weeksDaysPlus: {
    textAlign: 'center',
    fontSize: 35,
  },
});
