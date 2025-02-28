import { Field, FieldInputProps, FieldProps, useFormikContext } from 'formik';
import {
  FormControl,
  Grid2 as Grid,
  Paper,
  MenuItem,
  SxProps,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { Select, TextField } from 'formik-mui';
import { DatePicker } from '@mui/x-date-pickers';

import { sexOptions } from 'src/shared/constants';
import { handleChangeCustom } from '../../handlers';
import { PatientField, PatientState } from '../../state';
import moment, { Moment } from 'moment';
import { DATE_FORMAT } from 'src/shared/utils';
import { MouseEvent } from 'react';

const TOGGLE_SX: SxProps = {
  ':selected': {
    border: '1px solid #3f51b5 !important',
    fontWeight: 'bold',
    color: '#3f51b5 !important',
  },
  flexGrow: 1,
};

export const PersonalInfoForm = () => {
  const formikContext = useFormikContext<PatientState>();

  return (
    <Paper sx={{ padding: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ sm: 12, md: 4 }}>
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
        <Grid size={{ sm: 12, md: 4 }}>
          <Field
            component={TextField}
            fullWidth
            inputProps={{ maxLength: 50 }}
            variant="outlined"
            label="Household Number"
            name={PatientField.householdNumber}
          />
        </Grid>
        <Grid size={{ sm: 12, md: 4 }}>
          <Field
            component={TextField}
            fullWidth
            inputProps={{ maxLength: 50 }}
            variant="outlined"
            label="Village Number"
            name={PatientField.villageNumber}
          />
        </Grid>
        <Grid size={{ sm: 12, md: 4 }}>
          <Field
            component={TextField}
            fullWidth
            inputProps={{ maxLength: 20 }}
            variant="outlined"
            label="Zone ID"
            name={PatientField.zone}
          />
        </Grid>
        <Grid size={{ sm: 12, md: 4 }}>
          <IsExactDateOfBirthButtonGroup />
        </Grid>
        <Grid size={{ sm: 12, md: 2 }}>
          {formikContext.values.isExactDateOfBirth ? (
            <Field
              component={DateOfBirthField}
              name={PatientField.dateOfBirth}
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
              inputProps={{ pattern: '[0-200]*' }}
            />
          )}
        </Grid>
        <Grid size={{ sm: 12, md: 2 }}>
          <FormControl fullWidth variant="outlined">
            <Field
              component={Select}
              fullWidth
              required
              label="Gender *"
              name={PatientField.patientSex}
              onChange={handleChangeCustom(
                formikContext.handleChange,
                formikContext.setFieldValue
              )}>
              {Object.entries(sexOptions).map(([value, name]) => (
                <MenuItem key={value} value={value}>
                  {name}
                </MenuItem>
              ))}
            </Field>
          </FormControl>
        </Grid>
        <Grid size={12}>
          <Field
            component={TextField}
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label="Allergies"
            name={PatientField.allergy}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

const DateOfBirthField = ({ field, form, meta }: FieldProps<string>) => {
  const handleChange = async (value: Moment | null) => {
    const stringValue = value ? value.format(DATE_FORMAT) : '';
    await form.setFieldValue(field.name, stringValue);
  };
  const fieldProps = {
    ...field,
    value:
      field.value.trim().length === 0 ? null : moment(field.value, DATE_FORMAT),
    onChange: handleChange,
  };
  return <DatePicker label={'Date of Birth'} disableFuture {...fieldProps} />;
};

const IsExactDateOfBirthButtonGroup = () => {
  const fieldName = PatientField.isExactDateOfBirth;
  const formikContext = useFormikContext<PatientState>();
  const { setValue } = formikContext.getFieldHelpers(fieldName);
  const value = formikContext.values[fieldName];
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      size="large"
      sx={{ width: '100%' }}
      onChange={(_, value) => {
        if (value !== null) {
          setValue(value);
        }
      }}>
      <ToggleButton sx={TOGGLE_SX} value={true}>
        Date of Birth
      </ToggleButton>
      <ToggleButton sx={TOGGLE_SX} value={false}>
        Estimated Age
      </ToggleButton>
    </ToggleButtonGroup>
  );
};
