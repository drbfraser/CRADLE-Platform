import { FollowUpInfo } from './followUp/info';
import { FollowUpModal } from './followUp/modal';
import { Icon } from 'semantic-ui-react';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { getPrettyDateTime } from '../../../utils';

interface IProps {
  readingId: any;
  referral: any;
}

export const ReferralInfo: React.FC<IProps> = ({ readingId, referral }) =>
  referral ? (
    <>
      <Typography variant="h4" component="h4">
        {referral.followUp ? `Referral Assessed` : `Referral Pending`}
      </Typography>
      <br />
      <Typography variant="subtitle1">
        <Icon
          name="clock outline"
          size="large"
          style={{ lineHeight: `0.7em` }}
        />
        Referred on {getPrettyDateTime(referral.dateReferred)}
      </Typography>
      <br /> <br />
      <Typography variant="subtitle1">
        <Icon
          style={{ lineHeight: `0.7em` }}
          name="building outline"
          size="large"
        />
        Referred to {referral.referralHealthFacilityName}
      </Typography>
      {!referral.followUp && (
        <div style={{ padding: `10px 0` }}>
          <Typography variant="h6" component="h6">
            Comment:
          </Typography>
          <Typography variant="subtitle1">
            {referral.comment}
          </Typography>
        </div>
      )}
      <br />
      <FollowUpInfo followUp={referral.followUp} />
      <FollowUpModal
        readingId={readingId}
        referralId={referral.id}
        initialValues={referral.followUp}
      />
    </>
  ) : (
    <div style={{ padding: `80px 0px` }}>
      <Typography variant="h4" component="h4">
        No Referral
      </Typography>
    </div>
  );