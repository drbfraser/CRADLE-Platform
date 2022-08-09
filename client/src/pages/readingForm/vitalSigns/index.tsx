import React from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import Paper from '@mui/material/Paper';
import { Field } from 'formik';
import { FormPageProps, ReadingField } from '../state';
import { CheckboxWithLabel, Select, TextField } from 'formik-material-ui';

const urineTestFields = {
  [ReadingField.leukocytes]: 'Leukocytes',
  [ReadingField.nitrites]: 'Nitrites',
  [ReadingField.glucose]: 'Glucose',
  [ReadingField.protein]: 'Protein',
  [ReadingField.blood]: 'Blood',
};

const urineTestOptions = ['NAD', '+', '++', '+++'];

export const VitalSigns = ({ formikProps }: FormPageProps) => {
  return (
    <Grid container spacing={2}>
      <Grid item md={6} sm={12}>
        <Paper>
          <Box p={2}>
            <h2>Vital Signs</h2>
            <Box pl={4} pr={4}>
              <Field
                component={TextField}
                variant="outlined"
                type="number"
                fullWidth
                required
                label={'Systolic'}
                name={ReadingField.bpSystolic}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">mm/Hg</InputAdornment>
                  ),
                }}
              />
              <br />
              <br />
              <Field
                component={TextField}
                variant="outlined"
                type="number"
                fullWidth
                required
                label={'Diastolic'}
                name={ReadingField.bpDiastolic}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">mm/Hg</InputAdornment>
                  ),
                }}
              />
              <br />
              <br />
              <Field
                component={TextField}
                variant="outlined"
                type="number"
                fullWidth
                required
                label={'Heart Rate'}
                name={ReadingField.heartRateBPM}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">BPM</InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>
        </Paper>
      </Grid>
      <Grid item md={6} sm={12} xs={12}>
        <Paper>
          <Box p={2}>
            <h2>
              Urine Test &nbsp; &nbsp;
              <Field
                style={{ marginTop: -4, padding: 4 }}
                component={CheckboxWithLabel}
                type="checkbox"
                name={ReadingField.urineTest}
              />
            </h2>
            <Box pl={4} pr={4}>
              {Object.entries(urineTestFields).map(
                ([name, label]: [ReadingField, string]) => {
                  const disabled = !formikProps.values[ReadingField.urineTest];
                  const required = !disabled;
                  const errorMsg = formikProps.errors[name];
                  const hasError =
                    formikProps.touched[name] && Boolean(errorMsg);

                  return (
                    <React.Fragment key={name}>
                      <FormControl
                        fullWidth
                        variant="outlined"
                        disabled={disabled}
                        required={required}
                        error={hasError}>
                        <InputLabel>{label}</InputLabel>
                        <Field
                          component={Select}
                          label={label}
                          name={name}
                          disabled={disabled}>
                          {urineTestOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Field>
                        {hasError && (
                          <FormHelperText>{errorMsg}</FormHelperText>
                        )}
                      </FormControl>
                      <br />
                      <br />
                    </React.Fragment>
                  );
                }
              )}
            </Box>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};
