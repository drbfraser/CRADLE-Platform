import { Grid, IconButton, Tooltip, Typography } from '@mui/material';

import { Add } from '@mui/icons-material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Patient } from 'src/shared/types';
import { PrimaryButton } from 'src/shared/components/Button';
import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { goBackWithFallback } from 'src/shared/utils';
import { useHistory } from 'react-router-dom';

interface IProps {
  patient?: Patient;
  isThereAPendingReferral: boolean;
  setConfirmDialogPerformAssessmentOpen: any;
}

export const Header = ({
  patient,
  isThereAPendingReferral,
  setConfirmDialogPerformAssessmentOpen,
}: IProps) => {
  const history = useHistory();
  const handleSubmitNewFormClick = () => {
    if (patient) {
      history.push(`/forms/new/${patient.patientId}`);
    }
  };

  const handleAddReadingClick = () => {
    if (patient) {
      history.push(`/readings/new/${patient.patientId}`);
    }
  };

  const handleCreateReferralClick = () => {
    if (patient) {
      history.push(`/referrals/new/${patient.patientId}`);
    }
  };

  const handlePerformAssessmentClick = () => {
    if (isThereAPendingReferral) {
      setConfirmDialogPerformAssessmentOpen(true);
    } else if (patient) {
      history.push(`/assessments/new/${patient.patientId}`);
    }
  };

  return (
    <Grid container justifyContent="space-between">
      <Grid item>
        <Grid container alignItems="center">
          <Tooltip title="Go back" placement="top">
            <IconButton
              onClick={() => goBackWithFallback('/patients')}
              size="large">
              <ChevronLeftIcon color="inherit" fontSize="large" />
            </IconButton>
          </Tooltip>
          <Typography variant="h3">
            {patient ? (
              `Patient Summary for ${patient.patientName}`
            ) : (
              <Skeleton width={500} />
            )}
          </Typography>
        </Grid>
      </Grid>
      <Grid item>
        <Grid container alignItems="center" style={{ gap: 5 }}>
          <PrimaryButton onClick={handleSubmitNewFormClick}>
            <Add /> Submit New Form
          </PrimaryButton>
          <PrimaryButton onClick={handleAddReadingClick}>
            <Add /> Add New Reading
          </PrimaryButton>
          <PrimaryButton onClick={handleCreateReferralClick}>
            <Add /> Create Referral
          </PrimaryButton>
          <PrimaryButton onClick={handlePerformAssessmentClick}>
            <Add /> Perform Assessment
          </PrimaryButton>
        </Grid>
      </Grid>
    </Grid>
  );
};
