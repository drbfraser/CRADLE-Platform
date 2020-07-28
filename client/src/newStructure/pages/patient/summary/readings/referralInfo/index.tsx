import { FollowUp, OrNull } from '@types';

import { FollowUpInfo } from './followup/info';
import { FollowUpModal } from './followup/modal';
import { Header } from './header';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { useStyles } from './styles';

interface IProps {
  readingId: string;
  referral: OrNull<{
    id: string;
    dateReferred: number;
    comment: string;
    followUp: OrNull<FollowUp>;
    referralHealthFacilityName: string;
  }>;
}

export const ReferralInfo: React.FC<IProps> = ({ readingId, referral }) => {
  const classes = useStyles();

  return referral ? (
    <div className={classes.container}>
      <Header
        dateReferred={referral.dateReferred}
        followup={referral.followUp}
        healthFacilityName={referral.referralHealthFacilityName}
      />
      {!referral.followUp && (
        <div className={classes.comment}>
          <Typography>
            <b>Comment:</b>
          </Typography>
          <Typography variant="subtitle1">{referral.comment}</Typography>
        </div>
      )}
      <FollowUpInfo followUp={referral.followUp} />
      <FollowUpModal
        readingId={readingId}
        referralId={referral.id}
        initialValues={referral.followUp}
      />
    </div>
  ) : (
    <div className={classes.container}>
      <Typography variant="h5" component="h3">
        No Referral
      </Typography>
    </div>
  );
};
