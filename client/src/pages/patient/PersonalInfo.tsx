import {
  Box,
  Divider,
  Unstable_Grid2 as Grid,
  Paper,
  Typography,
} from '@mui/material';

import { Patient } from 'src/shared/types';
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import { SecondaryButton } from 'src/shared/components/Button';
import { Skeleton } from '@mui/material';
import { getAgeToDisplay } from 'src/shared/utils';
import { useHistory } from 'react-router-dom';

interface IProps {
  patient?: Patient;
}

export const PersonalInfo = ({ patient }: IProps) => {
  const history = useHistory();
  const handleEditClick = () =>
    history.push(`/patients/${patient?.patientId}/edit/personalInfo`);

  return (
    <Paper>
      <Box p={3}>
        <Typography component="h5" variant="h5">
          <RecentActorsIcon fontSize="large" />
          Personal Information
        </Typography>
        <Divider />
        {patient ? (
          <>
            <Box m={2}>
              <Grid container spacing={2}>
                <Grid xs={6}>
                  <b>ID: </b>
                  {patient.patientId}
                </Grid>
                <Grid xs={6}>
                  <b>Sex: </b>
                  {patient.patientSex}
                </Grid>

                <Grid xs={12}>
                  <b>Age: </b>
                  {patient.dob === undefined || patient.dob === null
                    ? `N/A`
                    : getAgeToDisplay(patient.dob, patient.isExactDob)}
                </Grid>

                <Grid xs={6}>
                  <b> Zone: </b>
                  {patient.zone ? patient.zone : `N/A`}
                </Grid>
                <Grid xs={6}>
                  <b>Village: </b>
                  {patient.villageNumber ? patient.villageNumber : `N/A`}
                </Grid>

                <Grid xs={12}>
                  <b>Household number: </b>
                  {patient.householdNumber ? patient.householdNumber : `N/A`}
                </Grid>

                <Grid xs={12}>
                  <b>Allergies: </b>
                  {patient.allergy ? patient.allergy : `N/A`}
                </Grid>
              </Grid>
            </Box>

            <SecondaryButton onClick={handleEditClick} size="small">
              Edit Patient
            </SecondaryButton>
          </>
        ) : (
          <Skeleton variant="rectangular" height={200} />
        )}
      </Box>
    </Paper>
  );
};
