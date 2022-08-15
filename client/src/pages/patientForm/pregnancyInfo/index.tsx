import { CheckboxWithLabel, Select, TextField } from 'formik-mui';
import { Field, FormikProps } from 'formik';
import { GestationalAgeUnitEnum, SexEnum } from 'src/shared/enums';
import { InputAdornment, Typography } from '@mui/material';
import {
  PatientField,
  PatientState,
  gestationalAgeUnitOptions,
} from '../state';

import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import { handleChangeCustom } from '../handlers';
import makeStyles from '@mui/styles/makeStyles';

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
          {!creatingNew && (
            <>
              <Grid item md={4} sm={12}>
                <Field
                  component={TextField}
                  fullWidth
                  variant="outlined"
                  type="date"
                  label="End Date"
                  name={PatientField.pregnancyEndDate}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required={Boolean(formikProps.values.pregnancyOutcome)}
                />
              </Grid>
              <Grid item md={6} sm={12}>
                <Field
                  component={TextField}
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  label="Outcome (e.g. mode of delivery, birth weight)"
                  placeholder="Mode of delivery, birth weight"
                  name={PatientField.pregnancyOutcome}
                  required={Boolean(formikProps.values.pregnancyEndDate)}
                />
              </Grid>
            </>
          )}
        </Grid>
        {creatingNewPregnancy && (
          <Typography color="textSecondary" variant="caption">
            Only fill in end date and outcome if you want to add a completed
            pregnancy
          </Typography>
        )}
        {!creatingNew && !creatingNewPregnancy && (
          <Typography color="textSecondary" variant="caption">
            Filling in end date and outcome will close this pregnancy
          </Typography>
        )}
        {formikProps.values.patientSex === SexEnum.MALE && (
          <Typography color="textSecondary" variant="caption">
            Cannot fill because the patient is Male, click Next
          </Typography>
        )}
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
