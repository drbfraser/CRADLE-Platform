import React from 'react';
import Box from '@material-ui/core/Box';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { Field } from 'formik';
import { ReadingField } from '../state';

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

export const VitalSigns = () => {
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
            <h2>Urine Test</h2>
            {/* Add checkbox to see if a urine test will be submitted */}
            <Box pl={4} pr={4}>
            {
              Object.entries(urineTestFields).map(([name, label]) => (
                <>
                  <FormControl fullWidth variant="outlined" required>
                    <InputLabel>{label}</InputLabel>
                    <Field
                      component={Select}
                      fullWidth
                      label={label}
                      name={name}
                      >
                      {urineTestOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                  <br/><br/>
                </>
              ))
            }
            </Box>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  )
};
