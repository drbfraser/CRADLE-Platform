import Select from '@material-ui/core/Select';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem/MenuItem';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import React, { useReducer } from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { makeStyles } from '@material-ui/core/styles';
import { setPatientField } from './state/actions';
import { GENDERS, GESTATIONAL_AGE_UNITS, initialState, PatientField } from './state/state';
import { reducer } from './state/reducer';

const gestationalAgeUnitOptions = [
  { name: 'Weeks', value: GESTATIONAL_AGE_UNITS.WEEKS },
  { name: 'Months', value: GESTATIONAL_AGE_UNITS.MONTHS },
];

const genderOptions = [
  { name: 'Male', value: GENDERS.MALE },
  { name: 'Female', value: GENDERS.FEMALE },
];

export const NewPatientPage = () => {
  const classes = useStyles();
  const [patient, dispatch] = useReducer(reducer, initialState);
  const setField = (f: PatientField, v: any) => dispatch(setPatientField(f, v))

  return (
    <>
      <h1>New Patient</h1>
      <Paper>
        <Box p={2}>
          <Grid container spacing={2}>
            <Grid item md={4}>
              <TextField
                fullWidth
                variant="outlined"
                label="Patient ID"
                value={patient.patientId}
                onChange={(e) => setField(PatientField.patientId, e.target.value)}
                error={patient.error.patientId}
                helperText={patient.error.patientId ? 'Enter a valid ID number.' : ''}
                required
              />
            </Grid>
            <Grid item md={4}>
              <TextField
                fullWidth
                variant="outlined"
                label="Patient Name"
                value={patient.patientName}
                onChange={(e) => setField(PatientField.patientName, e.target.value)}
                required
              />
            </Grid>
            <Grid item md={4}>
              <TextField
                fullWidth
                variant="outlined"
                label="Household Number"
                value={patient.householdNum}
                onChange={(e) => setField(PatientField.householdNum, e.target.value)}
              />
            </Grid>
            <Grid item md={4}>
              <ToggleButtonGroup
                exclusive
                size="large"
                value={patient.isExactDob}
                onChange={(_, newVal) => setField(PatientField.isExactDob, newVal)}>
                <ToggleButton
                  classes={{ selected: classes.toggle }}
                  value={true}
                >
                  Date of Birth
                </ToggleButton>
                <ToggleButton
                  classes={{ selected: classes.toggle }}
                  value={false}
                >
                  Estimated Age
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid item md={4}>
              {true ? (
                <TextField
                  fullWidth
                  variant="outlined"
                  type="date"
                  label="Date of Birth"
                  value={patient.dateOfBirth}
                  onChange={(e) => setField(PatientField.dateOfBirth, e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              ) : (
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Patient Age"
                  type="number"
                  value={patient.estimatedAge}
                  onChange={(e) => setField(PatientField.estimatedAge, e.target.value)}
                />
              )}
            </Grid>
            <Grid item md={2}>
              <TextField
                fullWidth
                variant="outlined"
                label="Zone"
                value={patient.zone}
                onChange={(e) => setField(PatientField.zone, e.target.value)}
              />
            </Grid>
            <Grid item md={2}>
              <TextField
                fullWidth
                variant="outlined"
                label="Village"
                value={patient.village}
                onChange={(e) => setField(PatientField.village, e.target.value)}
                required={true}
              />
            </Grid>
            <Grid item md={2}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Gender</InputLabel>
                <Select
                  fullWidth
                  label="Gender"
                  value={patient.gender}
                  onChange={(e) => setField(PatientField.gender, e.target.value)}>
                  {
                    genderOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.name}
                      </MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
            </Grid>
            <Grid item md={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={patient.pregnant}
                    onChange={(e) => setField(PatientField.pregnant, e.target.checked)}
                    color="primary"
                    disabled={!(patient.gender === GENDERS.FEMALE)}
                  />
                }
                label="Pregnant"
              />
            </Grid>
            <Grid item md={4}>
              <TextField
                fullWidth
                variant="outlined"
                label="Gestational Age"
                value={patient.gestationalAge}
                type="number"
                disabled={!patient.pregnant}
                onChange={(e) => setField(PatientField.gestationalAge, e.target.value)}
              />
            </Grid>
            <Grid item md={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Gestational Age Unit</InputLabel>
                <Select
                  fullWidth
                  label="Gestational Age Unit"
                  value={patient.gestationalAgeUnit}
                  disabled={!patient.pregnant}
                  onChange={(e) => setField(PatientField.gestationalAgeUnit, e.target.value)}>
                  {
                    gestationalAgeUnitOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.name}
                      </MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
            </Grid>
            <Grid item md={6}>
              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                label="Drug History"
                value={patient.drugHistory}
                onChange={(e) => setField(PatientField.drugHistory, e.target.value)}
              />
            </Grid>
            <Grid item md={6}>
              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                label="Medical History"
                value={patient.medicalHistory}
                onChange={(e) => setField(PatientField.medicalHistory, e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </>
  );
};

const useStyles = makeStyles({
  toggle: {
    border: '1px solid #3f51b5 !important',
    fontWeight: 'bold',
    color: '#3f51b5 !important',
  },
});