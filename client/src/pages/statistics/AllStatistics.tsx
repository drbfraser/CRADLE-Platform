import React from 'react';
import { StatisticDashboard } from './utils/StatisticDashboard';
import { API_URL } from 'src/shared/api';
import { EndpointEnum } from 'src/shared/enums';
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
      <Divider className={classes.divider} />
      <br />
      <StatisticDashboard
        url={API_URL + EndpointEnum.STATS_ALL + `?from=${from}&to=${to}`}
      />
    </div>
  );
};
