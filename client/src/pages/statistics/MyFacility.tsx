import { IUserWithTokens, OrNull } from 'src/shared/types';

import Divider from '@mui/material/Divider';
import React from 'react';
import { ReduxState } from 'src/redux/reducers';
import { StatisticDashboard } from './utils/StatisticDashboard';
import Typography from '@mui/material/Typography';
import { getFacilityStatisticsAsync } from 'src/shared/api';
import { useSelector } from 'react-redux';
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
        getData={() => getFacilityStatisticsAsync(facilityName, from, to)}
      />
    </div>
  );
};
