import { Field } from 'formik';
import { Grid2 as Grid, Paper, TextField } from '@mui/material';
import { PatientField } from '../../state';

interface IProps {
  creatingNew: boolean;
  isDrugRecord?: boolean;
}

export const MedicalInfoForm = ({ creatingNew, isDrugRecord }: IProps) => {
  const renderField = (label: string, name: string) => (
    <Field
      component={TextField}
      label={label}
      name={name}
      variant="outlined"
      fullWidth
      multiline
      rows={4}
    />
  );

  return (
    <Paper sx={{ padding: 2 }}>
      <Grid container spacing={2}>
        {creatingNew ? (
          <>
            <Grid size={{ sm: 12, md: 6 }}>
              {renderField('Medical History', PatientField.medicalHistory)}
            </Grid>
            <Grid size={{ sm: 12, md: 6 }}>
              {renderField('Drug History', PatientField.drugHistory)}
            </Grid>
          </>
        ) : (
          <Grid size={12}>
            {isDrugRecord
              ? renderField('Drug History', PatientField.drugHistory)
              : renderField('Medical History', PatientField.medicalHistory)}
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};
