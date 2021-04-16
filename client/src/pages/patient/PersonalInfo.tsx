import React from 'react';
import { Paper, Typography, Divider, Button, Box } from '@material-ui/core';
import RecentActorsIcon from '@material-ui/icons/RecentActors';
import { Patient } from 'src/types';
import { getAgeToDisplay } from 'src/shared/utils';
import { Skeleton } from '@material-ui/lab';
import { useHistory } from 'react-router-dom';

interface IProps {
  patient?: Patient;
}

export const PersonalInfo = ({ patient }: IProps) => {
  const history = useHistory();
  const handleEditClick = () =>
    history.push(`/patients/edit/${patient?.patientId}`);

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
            <Button
              color="primary"
              variant="outlined"
              onClick={handleEditClick}>
              Edit Patient
            </Button>
          </div>
        ) : (
          <Skeleton variant="rect" height={200} />
        )}
      </Box>
    </Paper>
  );
};
