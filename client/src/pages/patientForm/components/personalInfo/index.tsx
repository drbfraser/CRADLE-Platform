import { useState } from 'react';
import { Field, useFormikContext } from 'formik';
import {
  FormControl,
  Grid2 as Grid,
  Paper,
  MenuItem,
  SxProps,
  ToggleButton,
} from '@mui/material';
import { Select, TextField, ToggleButtonGroup } from 'formik-mui';

import { PatientIDExists } from './PatientIDExists';
import { getPatientPregnancyInfoAsync } from 'src/shared/api/api';
import { sexOptions } from 'src/shared/constants';
import { handleChangeCustom } from '../../handlers';
import { PatientField, PatientState } from '../../state';

const TOGGLE_SX: SxProps = {
  ':selected': {
    border: '1px solid #3f51b5 !important',
    fontWeight: 'bold',
    color: '#3f51b5 !important',
  },
  flexGrow: 1,
};

interface IProps {
  creatingNew: boolean;
}

export const PersonalInfoForm = ({ creatingNew }: IProps) => {
  const formikContext = useFormikContext<PatientState>();

  // for *new* patients only, track whether the patient ID already exists
  const [existingPatientId, setExistingPatientId] = useState<string | null>(
    null
  );

  const handlePatientIdBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    formikContext.handleBlur(e);

    try {
      const patientId = e.target.value;
      setExistingPatientId(patientId);
      if (patientId) {
        await getPatientPregnancyInfoAsync(patientId);
      }
    } catch (e) {
      setExistingPatientId(null);
    }
  };

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
            label="Patient ID"
            name={PatientField.patientId}
            onBlur={handlePatientIdBlur}
            disabled={!creatingNew}
          />
          {existingPatientId && (
            <PatientIDExists patientId={existingPatientId} />
          )}
        </Grid>
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
            component={ToggleButtonGroup}
            exclusive
            size="large"
            type="checkbox"
            value={formikContext.values.isExactDateOfBirth}
            name={PatientField.isExactDateOfBirth}
            sx={{ width: '100%' }}>
            <ToggleButton sx={TOGGLE_SX} value={true}>
              Date of Birth
            </ToggleButton>
            <ToggleButton sx={TOGGLE_SX} value={false}>
              Estimated Age
            </ToggleButton>
          </Field>
        </Grid>
        <Grid size={{ sm: 12, md: 2 }}>
          {formikContext.values.isExactDateOfBirth ? (
            <Field
              component={TextField}
              fullWidth
              required
              variant="outlined"
              type="date"
              label="Date of Birth"
              name={PatientField.dateOfBirth}
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
        <Grid size={{ sm: 12, md: 2 }}>
          <Field
            component={TextField}
            fullWidth
            inputProps={{ maxLength: 20 }}
            variant="outlined"
            label="Zone ID"
            name={PatientField.zone}
          />
        </Grid>
        <Grid size={{ sm: 12, md: 2 }}>
          <Field
            component={TextField}
            fullWidth
            inputProps={{ maxLength: 50 }}
            variant="outlined"
            label="Village Number"
            name={PatientField.villageNumber}
          />
        </Grid>
        <Grid size={{ sm: 12, md: 6 }}>
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
