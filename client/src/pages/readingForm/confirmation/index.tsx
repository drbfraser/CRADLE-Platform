import { FormPageProps, ReadingField } from '../state';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { TextField } from '@mui/material';
import { getSymptomsFromFormState } from '../symptoms/symptoms';
import makeStyles from '@mui/styles/makeStyles';

export const Confirmation = ({ formikProps }: FormPageProps) => {
  const classes = useStyles();

  return (
    <Paper className={classes.container}>
      <Box p={2}>
        <h2>Confirmation</h2>
        <h3>Symptoms</h3>
        <Grid container spacing={2}>
          <Grid item xs sm={6}>
            <TextField
              disabled
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              label="Symptoms"
              value={getSymptomsFromFormState(formikProps.values).join(', ')}
            />
          </Grid>
          <Grid item xs sm={6}>
            <TextField
              disabled
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              label="Other Symptoms"
              value={formikProps.values[ReadingField.otherSymptoms]}
            />
          </Grid>
        </Grid>
        <br />
        <br />
        <Grid container spacing={2}>
          <Grid item xs sm={6}>
            <h3>Vitals</h3>
            <TextField
              disabled
              fullWidth
              variant="outlined"
              label="Systolic"
              value={formikProps.values[ReadingField.bpSystolic]}
            />
            <br />
            <br />
            <TextField
              disabled
              fullWidth
              variant="outlined"
              label="Diastolic"
              value={formikProps.values[ReadingField.bpDiastolic]}
            />
            <br />
            <br />
            <TextField
              disabled
              fullWidth
              variant="outlined"
              label="Heart Rate"
              value={formikProps.values[ReadingField.heartRateBPM]}
            />
          </Grid>
          <br />
          <br />
          <Grid item xs sm={6}>
            <h3>Urine Test</h3>
            <TextField
              disabled
              fullWidth
              variant="outlined"
              label="Leukocytes"
              value={formikProps.values[ReadingField.leukocytes]}
            />
            <br />
            <br />
            <TextField
              disabled
              fullWidth
              variant="outlined"
              label="Nitrites"
              value={formikProps.values[ReadingField.nitrites]}
            />
            <br />
            <br />
            <TextField
              disabled
              fullWidth
              variant="outlined"
              label="Glucose"
              value={formikProps.values[ReadingField.glucose]}
            />
            <br />
            <br />
            <TextField
              disabled
              fullWidth
              variant="outlined"
              label="Protein"
              value={formikProps.values[ReadingField.protein]}
            />
            <br />
            <br />
            <TextField
              disabled
              fullWidth
              variant="outlined"
              label="Blood"
              value={formikProps.values[ReadingField.blood]}
            />
            <br />
            <br />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

const useStyles = makeStyles({
  container: {
    '& h3': {
      color: '#777',
    },
    '& textarea, & input': {
      color: '#000',
    },
  },
});
