import { Box, Divider, Paper, Typography } from '@mui/material';

import { Patient } from 'src/shared/types';
import React from 'react';
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
        <Typography component="h3" variant="h5">
          <RecentActorsIcon fontSize="large" /> &nbsp; Personal Information
        </Typography>
        <Divider />
        <br />
        {patient ? (
          <div>
            <p>
              <b>ID: </b> {patient.patientId} &nbsp;&nbsp;&nbsp;&nbsp;
              <b>Sex: </b> {patient.patientSex}
            </p>
            <p>
              <b>Age: </b>
              {patient.dob === undefined || patient.dob === null
                ? `N/A`
                : getAgeToDisplay(patient.dob, patient.isExactDob)}
            </p>
            <p>
              <b> Zone: </b>
              {patient.zone ? patient.zone : `N/A`}
              &nbsp;&nbsp;&nbsp;&nbsp;
              <b>Village: </b>
              {patient.villageNumber ? patient.villageNumber : `N/A`}
            </p>
            <p>
              <b>Household number: </b>
              {patient.householdNumber ? patient.householdNumber : `N/A`}
            </p>
            <p>
              <b>Allergies: </b>
              {patient.allergy ? patient.allergy : `N/A`}
            </p>
            <SecondaryButton onClick={handleEditClick}>
              Edit Patient
            </SecondaryButton>
          </div>
        ) : (
          <Skeleton variant="rectangular" height={200} />
        )}
      </Box>
    </Paper>
  );
};
