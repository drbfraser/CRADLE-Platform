// Import necessary components from Material UI
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

// Define the props interface for the PersonalInfo component
interface IProps {
  patient?: Patient;
}
// PersonalInfo functional component
export const PersonalInfo = ({ patient }: IProps) => {
  // useHistory hook to navigate the user
  const history = useHistory();

  // Event handler for edit button click
  const handleEditClick = () =>
    history.push(`/patients/${patient?.patientId}/edit/personalInfo`);

  // Render the PersonalInfo component
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
                {/* Display patient ID */}
                <Grid xs={6}>
                  <b>ID: </b>
                  {patient.patientId}
                </Grid>
                {/* Display patient sex */}
                <Grid xs={6}>
                  <b>Sex: </b>
                  {patient.patientSex}
                </Grid>

                {/* Display patient age */}
                <Grid xs={12}>
                  <b>Age: </b>
                  {patient.dob === undefined || patient.dob === null
                    ? `N/A`
                    : getAgeToDisplay(patient.dob, patient.isExactDob)}
                </Grid>

                {/* Display patient zone */}
                <Grid xs={6}>
                  <b> Zone: </b>
                  {patient.zone ? patient.zone : `N/A`}
                </Grid>
                {/* Display patient village */}
                <Grid xs={6}>
                  <b>Village: </b>
                  {patient.villageNumber ? patient.villageNumber : `N/A`}
                </Grid>

                {/* Display patient household number */}
                <Grid xs={12}>
                  <b>Household number: </b>
                  {patient.householdNumber ? patient.householdNumber : `N/A`}
                </Grid>

                {/* Display patient allergies */}
                <Grid xs={12}>
                  <b>Allergies: </b>
                  {patient.allergy ? patient.allergy : `N/A`}
                </Grid>
              </Grid>
            </Box>

            {/* Render edit button */}
            <SecondaryButton onClick={handleEditClick} size="small">
              Edit Patient
            </SecondaryButton>
          </>
        ) : (
          // Display a skeleton loader if patient data is not available
          <Skeleton variant="rectangular" height={200} />
        )}
      </Box>
    </Paper>
  );
};
