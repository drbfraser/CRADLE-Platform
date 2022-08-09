import { CancelButton, SecondaryButton } from 'src/shared/components/Button';
import { Grid, Typography } from '@mui/material';

import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import React from 'react';
import { Referral } from 'src/shared/types';
import { getPrettyDateTime } from 'src/shared/utils';
import { useHistory } from 'react-router-dom';

interface IProps {
  referral: Referral;
}

export const ReferralPendingData = ({ referral }: IProps) => {
  const history = useHistory();

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

        <Grid item>
          <Grid container alignItems="flex-start" style={{ gap: 7 }}>
            <SecondaryButton onClick={handlePerformAssessmentClick}>
              Assess Referral
            </SecondaryButton>
            <SecondaryButton onClick={handleReferralNotAttend}>
              Did Not Attend
            </SecondaryButton>
            <CancelButton onClick={handleReferralCancel}>Cancel</CancelButton>
          </Grid>
        </Grid>
      </>
    </>
  );
};
