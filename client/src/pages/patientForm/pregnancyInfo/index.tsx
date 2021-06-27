import React from 'react';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { Field, FormikProps } from 'formik';
import { CheckboxWithLabel, Select, TextField } from 'formik-material-ui';
import {
  PatientField,
  gestationalAgeUnitOptions,
  PatientState,
} from '../state';
import { GestationalAgeUnitEnum } from 'src/shared/enums';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import { InputAdornment } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { SexEnum } from 'src/shared/enums';
import { handleChangeCustom } from '../handlers';

interface IProps {
  formikProps: FormikProps<PatientState>;
  creatingNewPregnancy?: boolean;
  creatingNew: boolean;
}

export const PregnancyInfoForm = ({
  formikProps,
  creatingNewPregnancy,
  creatingNew,
}: IProps) => {
  const classes = useStyles();
  const isFemale = formikProps.values.patientSex === SexEnum.FEMALE;
  const isPregnant = formikProps.values.isPregnant;
  return (
    <Paper>
      <Box p={2}>
        <h2>Pregnancy Information</h2>
        <Grid container spacing={2}>
          {creatingNew && (
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
                disabled={!isFemale}
              />
            </Grid>
          )}
          <Grid item md={4} sm={12}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Gestational Age Unit</InputLabel>
              <Field
                component={Select}
                fullWidth
                label="Gestational Age Unit"
                name={PatientField.gestationalAgeUnit}
                required={(creatingNew && isPregnant) || creatingNewPregnancy}
                disabled={creatingNew && !isPregnant}>
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
                required={(creatingNew && isPregnant) || creatingNewPregnancy}
                disabled={creatingNew && !isPregnant}
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
                    required={
                      (creatingNew && isPregnant) || creatingNewPregnancy
                    }
                    disabled={creatingNew && !isPregnant}
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
                    required={
                      (creatingNew && isPregnant) || creatingNewPregnancy
                    }
                    disabled={creatingNew && !isPregnant}
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
