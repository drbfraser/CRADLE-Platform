import React from 'react';
import { Typography, Button, Grid } from '@material-ui/core';
import red from '@material-ui/core/colors/red';
import { ThemeProvider } from '@material-ui/styles';
import { createTheme } from '@material-ui/core/styles';
import AssignmentLateIcon from '@material-ui/icons/AssignmentLate';
import { Referral } from 'src/shared/types';
import { getPrettyDateTime } from 'src/shared/utils';
import { useHistory } from 'react-router-dom';

interface IProps {
  referral: Referral;
}

export const ReferralPendingData = ({ referral }: IProps) => {
  const history = useHistory();
  const redTheme = createTheme({ palette: { primary: red } });

  const handlePerformAssessmentClick = () => {
    if (referral) {
      history.push(`/assessments/new/${referral.patientId}/${referral.id}`);
    }
  };

  //goto SingleReasonForm
  const handleReferralNotAttend = () => {
    history.push(`/referrals/not-attend/${referral.id}/not_attend_referral`);
  };

  //goto SingleReasonForm
  const handleReferralCancel = () => {
    history.push(
      `/referrals/cancel-status-switch/${referral.id}/cancel_referral`
    );
  };

  return (
    <>
      <>
        <Typography variant="h5">
          <>
            <AssignmentLateIcon fontSize="large" /> Referral Pending
          </>
        </Typography>
        <Typography variant="subtitle1">
          Referred on {getPrettyDateTime(referral.dateReferred)}
        </Typography>
        <Typography variant="subtitle1">
          Referred to {referral.referralHealthFacilityName}
        </Typography>
        {Boolean(referral.comment) && (
          <div>
            <Typography>
              <b>Referral Comment:</b>
            </Typography>
            <Typography variant="subtitle1">{referral.comment}</Typography>
          </div>
        )}

        {/* // //////////////////////////// */}
        <Grid item>
          <Grid container alignItems="flex-start" style={{ gap: 7 }}>
            <Button
              color="primary"
              variant="contained"
              size="large"
              onClick={handlePerformAssessmentClick}>
              Assess Referral
            </Button>
            <Button
              color="primary"
              variant="contained"
              size="large"
              onClick={handleReferralNotAttend}>
              Did Not Attend
            </Button>

            <ThemeProvider theme={redTheme}>
              <Button
                color="primary"
                variant="contained"
                size="large"
                onClick={handleReferralCancel}>
                Cancel
              </Button>
            </ThemeProvider>
          </Grid>
        </Grid>
        {/* // //////////////////////////// */}
      </>
    </>
  );
};
