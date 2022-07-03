import { Grid, Typography } from '@material-ui/core';

import AssignmentLateIcon from '@material-ui/icons/AssignmentLate';
import React from 'react';
import { Referral } from 'src/shared/types';
import { SecondaryButton } from 'src/shared/components/Button';
import { getPrettyDateTime } from 'src/shared/utils';
import { useHistory } from 'react-router-dom';

interface IProps {
  referral: Referral;
}

export const ReferralCancelledData = ({ referral }: IProps) => {
  const history = useHistory();

  const handleUndoCancellation = () => {
    if (referral) {
      history.push(
        `/referrals/cancel-status-switch/${referral.id}/undo_cancel_referral`
      );
    }
  };

  return (
    <>
      <>
        <Typography variant="h5">
          <>
            <AssignmentLateIcon fontSize="large" /> Referral Cancelled
          </>
        </Typography>
        <Typography variant="subtitle1">
          Referred on {getPrettyDateTime(referral.dateReferred)}
        </Typography>
        <Typography variant="subtitle1">
          Cancelled on {getPrettyDateTime(referral.dateCancelled)}
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
        {Boolean(referral.cancelReason) && (
          <div>
            <Typography>
              <b>Cancellation Reason:</b>
            </Typography>
            <Typography variant="subtitle1">{referral.cancelReason}</Typography>
          </div>
        )}

        <Grid item>
          <Grid container alignItems="flex-start" style={{ gap: 7 }}>
            <SecondaryButton onClick={handleUndoCancellation}>
              Undo Cancellation
            </SecondaryButton>
          </Grid>
        </Grid>
      </>
    </>
  );
};
