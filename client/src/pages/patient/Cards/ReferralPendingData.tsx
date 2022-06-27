import React from 'react';
import { Typography, Grid } from '@material-ui/core';
import red from '@material-ui/core/colors/red';
import { ThemeProvider } from '@material-ui/styles';
import { createTheme } from '@material-ui/core/styles';
import AssignmentLateIcon from '@material-ui/icons/AssignmentLate';
import { Referral } from 'src/shared/types';
import { getPrettyDateTime } from 'src/shared/utils';
import { useHistory } from 'react-router-dom';
import { SecondaryButton } from 'src/shared/components/SecondaryButton';
import { CancelButton } from 'src/shared/components/cancelButton';

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
          <SecondaryButton
          text='Assess Referral'
          position="no right"
          task={handlePerformAssessmentClick}
          />
          <SecondaryButton
          text='Did Not Attend'
          position="no right"
          task={handleReferralNotAttend}
          />
            <ThemeProvider theme={redTheme}>
              <CancelButton
                text= "Cancel"
                task={handleReferralCancel}
                position = "no right"
              />
            </ThemeProvider>
          </Grid>
        </Grid>
        {/* // //////////////////////////// */}
      </>
    </>
  );
};
