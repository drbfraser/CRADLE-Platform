import React from 'react';
import { StatisticDashboard } from './utils/StatisticDashboard';
import { useSelector } from 'react-redux';
import { ReduxState } from 'src/redux/reducers';
import { IUserWithTokens, OrNull } from 'src/shared/types';
import { API_URL } from 'src/shared/api';
import { EndpointEnum } from 'src/shared/enums';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { useStatisticsStyles } from './utils/statisticStyles';

interface IProps {
  from: number;
  to: number;
}

type User = {
  user: OrNull<IUserWithTokens>;
};

export const MyFacility: React.FC<IProps> = ({ from, to }) => {
  const { user } = useSelector(
    ({ user }: ReduxState): User => ({
      user: user.current.data,
    })
  );
  const facilityName = user!.healthFacilityName;
  const classes = useStatisticsStyles();
  return (
    <div>
      <Typography variant="h5" gutterBottom>
        During this period, your facility has assessed:
      </Typography>
      <Divider className={classes.divider} />
      <br />
      <StatisticDashboard
        url={
          API_URL +
          EndpointEnum.STATS_FACILITY +
          `/${facilityName}?from=${from}&to=${to}`
        }
      />
    </div>
  );
};
