import React, { useState } from 'react';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid/Grid';
import Button from '@material-ui/core/Button/Button';
import { makeStyles } from '@material-ui/core/styles';
import { Formik, Form, Field } from 'formik';
import { gestationalAgeUnitOptions, PatientField, PatientState } from './state';
import { CheckboxWithLabel, Select, TextField } from 'formik-material-ui';
import { ToggleButtonGroup } from 'formik-material-ui-lab';
import ToggleButton from '@material-ui/lab/ToggleButton';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import { patientValidationSchema } from './validation';
import { useHistory } from 'react-router-dom';
import { PatientIDExists } from './PatientIDExists';
import { GestationalAgeUnitEnum, SexEnum, sexOptions } from 'src/enums';
import {
  handleChangeCustom,
  handleBlurPatientId,
  handleSubmit,
} from './handlers';
import { InputAdornment } from '@material-ui/core';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';

interface IProps {
  initialState: PatientState;
  creatingNew: boolean;
}

export const PatientForm = ({ initialState, creatingNew }: IProps) => {
  const classes = useStyles();
  const history = useHistory();
  const [submitError, setSubmitError] = useState(false);
  // for *new* patients only, track whether the patient ID already exists
  const [existingPatientId, setExistingPatientId] = useState<string | null>(
    null
  );

  return (
    <>
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <Formik
        initialValues={initialState}
        validationSchema={patientValidationSchema(creatingNew)}
        onSubmit={handleSubmit(creatingNew, history, setSubmitError)}>
        {({
          values,
          isSubmitting,
          handleChange,
          handleBlur,
          setFieldValue,
        }) => (
          <Form>
            <Paper>
              <Box p={2}>
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
                        handleBlur,
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
                      value={Boolean(values.isExactDob)}
                      name={PatientField.isExactDob}>
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
                  <Grid item md={4} sm={12}>
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
                  <Grid item md={2} sm={12}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Gender</InputLabel>
                      <Field
                        component={Select}
                        fullWidth
                        label="Gender"
                        name={PatientField.patientSex}
                        onChange={handleChangeCustom(
                          handleChange,
                          setFieldValue
                        )}>
                        {Object.entries(sexOptions).map(([value, name]) => (
                          <MenuItem key={value} value={value}>
                            {name}
                          </MenuItem>
                        ))}
                      </Field>
                    </FormControl>
                  </Grid>
                  <Grid item md={2} sm={12}>
                    <Field
                      component={CheckboxWithLabel}
                      type="checkbox"
                      name={PatientField.isPregnant}
                      onChange={handleChangeCustom(handleChange, setFieldValue)}
                      Label={{ label: 'Pregnant' }}
                      disabled={!(values.patientSex === SexEnum.FEMALE)}
                    />
                  </Grid>
                  <Grid item md={4} sm={12}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Gestational Age Unit</InputLabel>
                      <Field
                        component={Select}
                        fullWidth
                        label="Gestational Age Unit"
                        name={PatientField.gestationalAgeUnit}
                        required={values.isPregnant}
                        disabled={!values.isPregnant}>
                        {gestationalAgeUnitOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.name}
                          </MenuItem>
                        ))}
                      </Field>
                    </FormControl>
                  </Grid>
                  <Grid item md={4} sm={12}>
                    {values.gestationalAgeUnit ===
                    GestationalAgeUnitEnum.MONTHS ? (
                      <Field
                        component={TextField}
                        fullWidth
                        variant="outlined"
                        type="number"
                        name={PatientField.gestationalAgeMonths}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              months
                            </InputAdornment>
                          ),
                        }}
                        required={values.isPregnant}
                        disabled={!values.isPregnant}
                      />
                    ) : (
                      <Grid container>
                        <Grid item md={5} sm={12}>
                          <Field
                            component={TextField}
                            fullWidth
                            variant="outlined"
                            type="number"
                            name={PatientField.gestationalAgeWeeks}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  weeks
                                </InputAdornment>
                              ),
                            }}
                            required={values.isPregnant}
                            disabled={!values.isPregnant}
                          />
                        </Grid>
                        <Grid item md={2} sm={12}>
                          <div className={classes.weeksDaysPlus}>+</div>
                        </Grid>
                        <Grid item md={5} sm={12}>
                          <Field
                            component={TextField}
                            fullWidth
                            variant="outlined"
                            type="number"
                            name={PatientField.gestationalAgeDays}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  days
                                </InputAdornment>
                              ),
                            }}
                            required={values.isPregnant}
                            disabled={!values.isPregnant}
                          />
                        </Grid>
                      </Grid>
                    )}
                  </Grid>
                  <Grid item md={6} sm={12}>
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
                  <Grid item md={6} sm={12}>
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
            <br />
            <Button
              className={classes.right}
              color="primary"
              variant="contained"
              size="large"
              type="submit"
              disabled={isSubmitting || existingPatientId !== null}>
              {creatingNew ? 'Create New' : 'Save Changes'}
            </Button>
          </Form>
        )}
      </Formik>
    </>
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
