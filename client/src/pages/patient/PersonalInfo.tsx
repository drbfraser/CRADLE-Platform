import { Box, Divider, Grid2 as Grid, Paper, Typography } from '@mui/material';

import { Patient } from 'src/shared/types';
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import { SecondaryButton } from 'src/shared/components/Button';
import { Skeleton } from '@mui/material';
import { getAgeToDisplay } from 'src/shared/utils';
import { useNavigate } from 'react-router-dom';

interface IProps {
  patient?: Patient;
}

export const PersonalInfo = ({ patient }: IProps) => {
  const navigate = useNavigate();
  const handleEditClick = () =>
    navigate(`/patients/${patient?.id}/edit/personalInfo`);

  return (
    <Paper sx={{ padding: 3 }}>
      <Typography component="h5" variant="h5">
        <RecentActorsIcon fontSize="large" />
        Personal Information
      </Typography>
      <Divider />
      {patient ? (
        <>
          <Box m={2}>
            <Grid container spacing={2}>
              <Grid size={6}>
                <b>ID: </b>
                {patient.id}
              </Grid>
              <Grid size={6}>
                <b>Sex: </b>
                {patient.sex}
              </Grid>

              <Grid size={12}>
                <b>Age: </b>
                {patient.dateOfBirth === undefined ||
                patient.dateOfBirth === null
                  ? `N/A`
                  : getAgeToDisplay(
                      patient.dateOfBirth,
                      patient.isExactDateOfBirth
                    )}
              </Grid>

              <Grid size={6}>
                <b> Zone: </b>
                {patient.zone ? patient.zone : `N/A`}
              </Grid>
              <Grid size={6}>
                <b>Village Number: </b>
                {patient.villageNumber ? patient.villageNumber : `N/A`}
              </Grid>

              <Grid size={12}>
                <b>Household number: </b>
                {patient.householdNumber ? patient.householdNumber : `N/A`}
              </Grid>

              <Grid size={12}>
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
    </Paper>
  );
};
