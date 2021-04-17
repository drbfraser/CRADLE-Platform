import React from 'react';
import { StatisticDashboard } from './utils/StatisticDashboard';
import { EndpointEnum } from 'src/server';
import { BASE_URL } from 'src/server/utils';
import Typography from '@material-ui/core/Typography';
import { useStatisticsStyles } from './utils/statisticStyles';
import Divider from '@material-ui/core/Divider';

interface IProps {
  from: number;
  to: number;
}

export const AllStatistics: React.FC<IProps> = ({ from, to }) => {
  const classes = useStatisticsStyles();

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        During this period, all users and facilities have assessed:
      </Typography>
      <br />
      <Divider className={classes.divider} />
      <br />
      <StatisticDashboard
        url={BASE_URL + EndpointEnum.STATS_ALL + `?from=${from}&to=${to}`}
      />
    </div>
  );
};
