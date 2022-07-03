import { Grid, IconButton, Tooltip, Typography } from '@material-ui/core';

import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { Patient } from 'src/shared/types';
import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { goBackWithFallback } from 'src/shared/utils';
import { useHistory } from 'react-router-dom';
import { PrimaryButton } from '../../shared/components/primaryButton/index';

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
            <IconButton onClick={() => goBackWithFallback('/patients')}>
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
          <PrimaryButton
            text="+ Submit New Form"
            task={handleSubmitNewFormClick}
          />
          <PrimaryButton
            text="+ Add New Reading"
            task={handleAddReadingClick}
          />
          <PrimaryButton
            text="+ Create Referral"
            task={handleCreateReferralClick}
          />
          <PrimaryButton
            text="+ Perform Assessment"
            task={handlePerformAssessmentClick}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};
