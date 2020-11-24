import React, { useState } from 'react';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid/Grid';
import Button from '@material-ui/core/Button/Button';
import { makeStyles } from '@material-ui/core/styles';
import { Formik, Form, Field } from 'formik';
import { Toast } from '../../../src/shared/components/toast';
import { GESTATIONAL_AGE_UNITS, initialState, PatientField, SEXES } from './state';
import { CheckboxWithLabel, Select, TextField } from 'formik-material-ui';
import { ToggleButtonGroup } from 'formik-material-ui-lab';
import ToggleButton from '@material-ui/lab/ToggleButton';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import { validateForm } from './validation';
import { useHistory } from 'react-router-dom';
import { PatientIDExists } from './PatientIDExists';
import { handleChangeCustom, handlePatientIdBlur, handleSubmit } from './handlers';

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
  const [submitError, setSubmitError] = useState(false);
  const [existingPatientId, setExistingPatientId] = useState<string | null>(null);

  return (
    <>
    {submitError && (
      <Toast
        status="error"
        message="Something went wrong on our end. Please try that again."
        clearMessage={() => setSubmitError(false)}
      />
    )}
    <div className={classes.container}>
      <Formik
        initialValues={initialState}
        validate={validateForm}
        onSubmit={handleSubmit(history, setSubmitError)}>
        {({
          values,
          isSubmitting,
          handleChange,
          handleBlur,
          setFieldValue,
        }) => (
          <Form>
            <h1>New Patient</h1>
            <Paper>
              <Box p={2}>
                <Grid container spacing={2}>
                  <Grid item md={4}>
                    <Field
                      component={TextField}
                      fullWidth
                      required
                      variant="outlined"
                      label="Patient ID"
                      name={PatientField.patientId}
                      onBlur={handlePatientIdBlur(handleBlur, setExistingPatientId)}
                    />
                    {
                      existingPatientId != null && <PatientIDExists patientId={existingPatientId} />
                    }
                  </Grid>
                  <Grid item md={4}>
                    <Field
                      component={TextField}
                      fullWidth
                      required
                      variant="outlined"
                      label="Patient Name"
                      name={PatientField.patientName}
                    />
                  </Grid>
                  <Grid item md={4}>
                    <Field
                      component={TextField}
                      fullWidth
                      variant="outlined"
                      label="Household Number"
                      name="householdNumber"
                    />
                  </Grid>
                  <Grid item md={4}>
                    <Field
                      component={ToggleButtonGroup}
                      exclusive
                      size="large"
                      type="checkbox"
                      value={values.isExactDob}
                      name={PatientField.isExactDob}
                    >
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
                    </Field>
                  </Grid>
                  <Grid item md={4}>
                    {values.isExactDob ? (
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
                  <Grid item md={2}>
                    <Field
                      component={TextField}
                      fullWidth
                      variant="outlined"
                      label="Zone"
                      name={PatientField.zone}
                    />
                  </Grid>
                  <Grid item md={2}>
                    <Field
                      component={TextField}
                      fullWidth
                      variant="outlined"
                      label="Village"
                      name={PatientField.villageNumber}
                    />
                  </Grid>
                  <Grid item md={2}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Gender</InputLabel>
                      <Field
                        component={Select}
                        fullWidth
                        label="Gender"
                        name={PatientField.patientSex}
                        onChange={handleChangeCustom(handleChange, setFieldValue)}
                      >
                        {sexOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.name}
                          </MenuItem>
                        ))}
                      </Field>
                    </FormControl>
                  </Grid>
                  <Grid item md={2}>
                    <Field
                      component={CheckboxWithLabel}
                      type="checkbox"
                      name={PatientField.isPregnant}
                      onChange={handleChangeCustom(handleChange, setFieldValue)}
                      Label={{ label: 'Pregnant' }}
                      disabled={!(values.patientSex === SEXES.FEMALE)}
                    />
                  </Grid>
                  <Grid item md={4}>
                    <Field
                      component={TextField}
                      fullWidth
                      variant="outlined"
                      type="number"
                      label="Gestational Age"
                      name={PatientField.gestationalAge}
                      disabled={!values.isPregnant}
                    />
                  </Grid>
                  <Grid item md={4}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Gestational Age Unit</InputLabel>
                      <Field
                        component={Select}
                        fullWidth
                        label="Gestational Age Unit"
                        name={PatientField.gestationalAgeUnit}
                        disabled={!values.isPregnant}
                      >
                        {gestationalAgeUnitOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.name}
                          </MenuItem>
                        ))}
                      </Field>
                    </FormControl>
                  </Grid>
                  <Grid item md={6}>
                    <Field
                      component={TextField}
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      label="Drug History"
                      name={PatientField.drugHistory}
                    />
                  </Grid>
                  <Grid item md={6}>
                    <Field
                      component={TextField}
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      label="Medical History"
                      name={PatientField.medicalHistory}
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
              type="submit"
              disabled={isSubmitting || (existingPatientId !== null)}>
              Create Patient
            </Button>
          </Form>
        )}
      </Formik>
    </div>
    </>
  );
}

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
  