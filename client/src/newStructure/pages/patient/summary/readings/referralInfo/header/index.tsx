import { FollowUp, OrNull } from '@types';

import AssignmentLateIcon from '@material-ui/icons/AssignmentLate';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { getPrettyDateTime } from '../../../../../../shared/utils';
import { useStyles } from './styles';

interface IProps {
  dateReferred: number;
  followup: OrNull<FollowUp>;
  healthFacilityName: string;
}

export const Header: React.FC<IProps> = ({
  dateReferred,
  followup,
  healthFacilityName,
}) => {
  const classes = useStyles();

  return (
    <>
      <Typography className={classes.title} component="h3" variant="h5">
        {followup ? (
          <AssignmentTurnedInIcon fontSize="large" />
        ) : (
          <AssignmentLateIcon fontSize="large" />
        )}
        {followup ? `Referral Assessed` : `Referral Pending`}
      </Typography>
      <Typography className={classes.subtitle} variant="subtitle1">
        Referred on {getPrettyDateTime(dateReferred)}
      </Typography>
      <Typography variant="subtitle1">
        Referred to {healthFacilityName}
      </Typography>
    </>
  );
};
