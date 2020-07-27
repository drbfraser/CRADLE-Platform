import { FollowUp, OrNull } from '@types';

import { FollowUpInfo } from './followup/info';
import { FollowUpModal } from './followup/modal';
import { Icon } from 'semantic-ui-react';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { getPrettyDateTime } from '../../../../shared/utils';

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
  if (referral) {
    return (
      <div>
        <Typography variant="h4" component="h4">
          {referral.followUp ? 'Referral Assessed' : 'Referral Pending'}
        </Typography>
        <br />
        <Typography variant="subtitle1">
          <Icon
            name="clock outline"
            size="large"
            style={{ lineHeight: '0.7em' }}
          />
          Referred on {getPrettyDateTime(referral.dateReferred)}
        </Typography>
        <br />
        <br />
        <Typography variant="subtitle1">
          <Icon
            style={{ lineHeight: '0.7em' }}
            name="building outline"
            size="large"
          />
          Referred to {referral.referralHealthFacilityName}
        </Typography>
        {!referral.followUp && (
          <div style={{ padding: '10px 0' }}>
            <Typography variant="h6" component="h6">
              Comment:
            </Typography>
            <Typography variant="subtitle1">{referral.comment}</Typography>
          </div>
        )}
        <br />
        <FollowUpInfo followUp={referral.followUp} />
        <FollowUpModal
          readingId={readingId}
          referralId={referral.id}
          initialValues={referral.followUp}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: `80px 0px` }}>
      <Typography variant="h4" component="h4">
        No Referral
      </Typography>
    </div>
  );
};
