import Select from '@material-ui/core/Select';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem/MenuItem';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import React, { useEffect, useReducer, useState } from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { makeStyles } from '@material-ui/core/styles';
import { setPatientField } from './state/actions';
import {
  SEXES,
  GESTATIONAL_AGE_UNITS,
  initialState,
  PatientField,
} from './state/state';
import { reducer } from './state/reducer';
import Button from '@material-ui/core/Button';
import { BASE_URL } from '../../../src/server/utils';
import { EndpointEnum } from '../../../src/server';
import { useHistory } from 'react-router-dom';
import { Toast } from '../../../src/shared/components/toast';

const gestationalAgeUnitOptions = [
  { name: 'Weeks', value: GESTATIONAL_AGE_UNITS.WEEKS },
  { name: 'Months', value: GESTATIONAL_AGE_UNITS.MONTHS },
];

const sexOptions = [
  { name: 'Male', value: SEXES.MALE },
  { name: 'Female', value: SEXES.FEMALE },
];

export const NewPatientPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const [patient, dispatch] = useReducer(reducer, initialState);
  const [hasError, setHasError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitError, setShowSubmitError] = useState(false);
  const setField = (f: PatientField, v: any) => dispatch(setPatientField(f, v));

  useEffect(() => {
    let error = false;
    for(let field in patient.error) {
      if(patient.error[field as PatientField]) {
        error = true;
        break;
      }
    }

    setHasError(error);
  }, [patient.error]);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // deep copy
    let patientData = JSON.parse(JSON.stringify(patient));

    delete patientData[PatientField.gestationalAge];
    delete patientData[PatientField.estimatedAge];
    delete patientData['error'];

    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
      body: JSON.stringify(patientData),
    };

    try {
      let resp = await fetch(BASE_URL + EndpointEnum.PATIENTS, fetchOptions);

      if (!resp.ok) {
        throw new Error('Response failed with error code: ' + resp.status)
      }

      let respJson = await resp.json();

      history.push('/patients/' + respJson['patientId']);
    }
    catch(e) {
      setShowSubmitError(true);
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {showSubmitError && (
        <Toast
          status="error"
          message="Something went wrong on our end. Please try that again."
          clearMessage={() => setShowSubmitError(false)}
        />
      )}
      <div className={classes.container}>
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
                  onChange={(e) =>
                    setField(PatientField.patientId, e.target.value)
                  }
                  error={patient.error.patientId}
                  helperText={
                    patient.error.patientId ? 'Enter a valid ID number.' : ''
                  }
                  required
                />
              </Grid>
              <Grid item md={4}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Patient Name"
                  value={patient.patientName}
                  onChange={(e) =>
                    setField(PatientField.patientName, e.target.value)
                  }
                  required
                />
              </Grid>
              <Grid item md={4}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Household Number"
                  value={patient.householdNumber}
                  onChange={(e) =>
                    setField(PatientField.householdNumber, e.target.value)
                  }
                />
              </Grid>
              <Grid item md={4}>
                <ToggleButtonGroup
                  exclusive
                  size="large"
                  value={patient.isExactDob}
                  onChange={(_, newVal) =>
                    setField(PatientField.isExactDob, newVal)
                  }>
                  <ToggleButton
                    classes={{ selected: classes.toggle }}
                    value={true}>
                    Date of Birth
                  </ToggleButton>
                  <ToggleButton
                    classes={{ selected: classes.toggle }}
                    value={false}>
                    Estimated Age
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
              <Grid item md={4}>
                {patient.isExactDob ? (
                  <TextField
                    fullWidth
                    variant="outlined"
                    type="date"
                    label="Date of Birth"
                    value={patient.dob}
                    onChange={(e) =>
                      setField(PatientField.dob, e.target.value)
                    }
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
                    onChange={(e) =>
                      setField(PatientField.estimatedAge, e.target.value)
                    }
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
                  value={patient.villageNumber}
                  onChange={(e) => setField(PatientField.villageNumber, e.target.value)}
                  required={true}
                />
              </Grid>
              <Grid item md={2}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Gender</InputLabel>
                  <Select
                    fullWidth
                    label="Gender"
                    value={patient.patientSex}
                    onChange={(e) =>
                      setField(PatientField.patientSex, e.target.value)
                    }>
                    {sexOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item md={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={patient.isPregnant}
                      onChange={(e) =>
                        setField(PatientField.isPregnant, e.target.checked)
                      }
                      color="primary"
                      disabled={!(patient.patientSex === SEXES.FEMALE)}
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
                  disabled={!patient.isPregnant}
                  onChange={(e) =>
                    setField(PatientField.gestationalAge, e.target.value)
                  }
                />
              </Grid>
              <Grid item md={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Gestational Age Unit</InputLabel>
                  <Select
                    fullWidth
                    label="Gestational Age Unit"
                    value={patient.gestationalAgeUnit}
                    disabled={!patient.isPregnant}
                    onChange={(e) =>
                      setField(PatientField.gestationalAgeUnit, e.target.value)
                    }>
                    {gestationalAgeUnitOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.name}
                      </MenuItem>
                    ))}
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
                  onChange={(e) =>
                    setField(PatientField.drugHistory, e.target.value)
                  }
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
                  onChange={(e) =>
                    setField(PatientField.medicalHistory, e.target.value)
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </Paper>
        <br/>
        <Button
          className={classes.right}
          color="primary"
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={isSubmitting || hasError}>
          Create Patient
        </Button>
      </div>
    </>
  );
};

const useStyles = makeStyles({
  container: {
    maxWidth: 1250,
    margin: '0 auto',
  },
  toggle: {
    border: '1px solid #3f51b5 !important',
    fontWeight: 'bold',
    color: '#3f51b5 !important',
  },
  right: {
    float: 'right',
  },
});
