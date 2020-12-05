import React from 'react';
import Box from '@material-ui/core/Box';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import { Field } from 'formik';
import { FormPageProps, ReadingField } from '../state';
import { CheckboxWithLabel, Select, TextField } from 'formik-material-ui';

const urineTestFields = {
  [ReadingField.leukocytes]: 'Leukocytes',
  [ReadingField.nitrites]: 'Nitrites',
  [ReadingField.glucose]: 'Glucose',
  [ReadingField.protein]: 'Protein',
  [ReadingField.blood]: 'Blood',
}

const urineTestOptions = [
  'NAD',
  '+',
  '++',
  '+++'
]

export const VitalSigns = (props: FormPageProps) => {
  return (
    <Grid container spacing={2}>
      <Grid item md>
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
              <br /><br />
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
              <br /><br />
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
              <br /><br />
              <Field
                component={TextField}
                variant="outlined"
                type="number"
                fullWidth
                label={'Respiratory Rate'}
                name={ReadingField.respiratoryRate}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">BPM</InputAdornment>
                  ),
                }}
              />
              <br /><br />
              <Field
                component={TextField}
                variant="outlined"
                type="number"
                fullWidth
                label={'Oxygen Saturation'}
                name={ReadingField.oxygenSaturation}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
              <br /><br />
              <Field
                component={TextField}
                variant="outlined"
                type="number"
                fullWidth
                label={'Temperature'}
                name={ReadingField.temperature}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">°C</InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>
        </Paper>
      </Grid>
      <Grid item md>
        <Paper>
          <Box p={2}>
            <h2>
              Urine Test &nbsp; &nbsp;
              <Field
                style={{marginTop: -4, padding: 4}}
                component={CheckboxWithLabel}
                type="checkbox"
                name={ReadingField.urineTest}
              />
            </h2>
            <Box pl={4} pr={4}>
            {
              Object.entries(urineTestFields).map(([name, label]) => {
                const disabled = !props.values[ReadingField.urineTest];
                const required = !disabled;

                return (
                  <React.Fragment key={name}>
                    <FormControl
                      fullWidth
                      variant="outlined"
                      disabled={disabled}
                      required={required}
                    >
                      <InputLabel>{label}</InputLabel>
                      <Field
                        component={Select}
                        label={label}
                        name={name}
                        disabled={disabled}
                        required={required}
                        >
                        {urineTestOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Field>
                    </FormControl>
                    <br/><br/>
                  </React.Fragment>
                );
              })
            }
            </Box>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  )
};
