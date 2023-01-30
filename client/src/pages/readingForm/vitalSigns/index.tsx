import { CheckboxWithLabel, TextField } from 'formik-mui';
import { FormPageProps, ReadingField } from '../state';

import Box from '@mui/material/Box';
import { Field } from 'formik';
import FormControl from '@mui/material/FormControl';
import { Fragment } from 'react';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';

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
                ([name, label]: [string, string]) => {
                  const disabled = !formikProps.values[ReadingField.urineTest];
                  const required = !disabled;
                  const errorMsg = formikProps.errors[name as ReadingField];
                  const hasError =
                    formikProps.touched[name as ReadingField] &&
                    Boolean(errorMsg);

                  return (
                    <Fragment key={name}>
                      <FormControl
                        fullWidth
                        variant="outlined"
                        disabled={disabled}
                        required={required}
                        error={hasError}>
                        <Field
                          component={TextField}
                          select
                          label={label}
                          name={name}
                          required={required}
                          disabled={disabled}>
                          {urineTestOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Field>
                      </FormControl>
                      <br />
                      <br />
                    </Fragment>
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
