import React from 'react';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { Field } from 'formik';
import { CheckboxWithLabel, Select, TextField } from 'formik-material-ui';
import {
  FormPageProps,
  PatientField,
  gestationalAgeUnitOptions,
} from '../state';
import { GestationalAgeUnitEnum } from 'src/shared/enums';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import { InputAdornment } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { SexEnum } from 'src/shared/enums';
import { handleChangeCustom } from '../handlers';

export const PregnancyInfoForm = ({ formikProps }: FormPageProps) => {
  const classes = useStyles();
  return (
    <Paper>
      <Box p={2}>
        <h2>Pregnancy Information</h2>
        <Grid container spacing={2}>
          <Grid item md={2} sm={12}>
            <Field
              component={CheckboxWithLabel}
              type="checkbox"
              name={PatientField.isPregnant}
              onChange={handleChangeCustom(
                formikProps.handleChange,
                formikProps.setFieldValue
              )}
              Label={{ label: 'Pregnant' }}
              disabled={!(formikProps.values.patientSex === SexEnum.FEMALE)}
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
                required={formikProps.values.isPregnant}
                disabled={!formikProps.values.isPregnant}>
                {gestationalAgeUnitOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.name}
                  </MenuItem>
                ))}
              </Field>
            </FormControl>
          </Grid>
          <Grid item md={4} sm={12}>
            {formikProps.values.gestationalAgeUnit ===
            GestationalAgeUnitEnum.MONTHS ? (
              <Field
                component={TextField}
                fullWidth
                variant="outlined"
                type="number"
                name={PatientField.gestationalAgeMonths}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">months</InputAdornment>
                  ),
                }}
                required={formikProps.values.isPregnant}
                disabled={!formikProps.values.isPregnant}
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
                        <InputAdornment position="end">weeks</InputAdornment>
                      ),
                    }}
                    required={formikProps.values.isPregnant}
                    disabled={!formikProps.values.isPregnant}
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
                        <InputAdornment position="end">days</InputAdornment>
                      ),
                    }}
                    required={formikProps.values.isPregnant}
                    disabled={!formikProps.values.isPregnant}
                  />
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

const useStyles = makeStyles({
  weeksDaysPlus: {
    textAlign: 'center',
    fontSize: 35,
  },
});
