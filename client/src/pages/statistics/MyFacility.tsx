import React from 'react';
import { StatisticDashboard } from './utils/StatisticDashboard';
import { useSelector } from 'react-redux';
import { ReduxState } from 'src/redux/reducers';
import { IUserWithTokens, OrNull } from 'src/types';
import { EndpointEnum } from 'src/server';
import { BASE_URL } from 'src/server/utils';
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
      <br />

      <Divider className={classes.divider} />
      <br />
      {from && to && (
        <StatisticDashboard
          url={
            BASE_URL +
            EndpointEnum.STATS_FACILITY +
            `/${facilityName}?from=${from!}&to=${to!}`
          }
        />
      )}
    </div>
  );
};
