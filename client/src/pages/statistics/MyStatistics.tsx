import React from 'react';
import { StatisticDashboard } from './utils/StatisticDashboard';
import { useSelector } from 'react-redux';
import { ReduxState } from 'src/redux/reducers';
import { IUserWithTokens, OrNull } from 'src/types';
import { useStatisticsStyles } from './utils/statisticStyles';
import { EndpointEnum } from 'src/server';
import { BASE_URL } from 'src/server/utils';
import Typography from '@material-ui/core/Typography';
import { ExportStatistics } from './utils/ExportStatistics';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';

interface IProps {
  from: number;
  to: number;
}

type User = {
  user: OrNull<IUserWithTokens>;
};

export const MyStatistics: React.FC<IProps> = ({ from, to }) => {
  const classes = useStatisticsStyles();
  const { user } = useSelector(
    ({ user }: ReduxState): User => ({
      user: user.current.data,
    })
  );
  const userId = user?.userId;

  return (
    <div>
      <Box className={classes.floatLeft}>
        <Typography variant="h5" gutterBottom>
          During this period, you have assessed:
        </Typography>
      </Box>
      <Box className={classes.floatRight}>
        <ExportStatistics
          url={
            BASE_URL +
            EndpointEnum.STATS_USER_EXPORT +
            `/${userId}?from=${from}&to=${to}`
          }
        />
      </Box>

      <br />
      <br />

      <Divider className={classes.divider} />
      <br />
      {from && to && (
        <StatisticDashboard
          url={
            BASE_URL +
            EndpointEnum.STATS_USER +
            `/${userId}?from=${from}&to=${to}`
          }
        />
      )}
    </div>
  );
};
