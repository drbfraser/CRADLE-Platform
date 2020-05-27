import { FollowUpInfo } from './followUp/info';
import { FollowUpModal } from './followUp/modal';
import { Icon } from 'semantic-ui-react';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { getPrettyDateTime } from '../../../../utils';
import classes from './styles.module.css';

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
          className={classes.icon}
          name="clock outline"
          size="large"
        />
        Referred on {getPrettyDateTime(referral.dateReferred)}
      </Typography>
      <br /> <br />
      <Typography variant="subtitle1">
        <Icon
          className={classes.icon}
          name="building outline"
          size="large"
        />
        Referred to {referral.referralHealthFacilityName}
      </Typography>
      {!referral.followUp && (
        <div className={classes.comment}>
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
    <div className={classes.noReferral}>
      <Typography variant="h4" component="h4">
        No Referral
      </Typography>
    </div>
  );
