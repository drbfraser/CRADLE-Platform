import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Box, Divider, Typography } from '@mui/material';

import { UserWithToken, OrNull } from 'src/shared/types';
import { ReduxState } from 'src/redux/reducers';
import { StatisticDashboard } from './utils/StatisticsDashboard';
import { DIVIDER_SX } from './utils/statisticStyles';
import { getFacilityStatisticsAsync } from 'src/shared/api/apiStatistics';

type User = {
  user: OrNull<UserWithToken>;
};

type Props = {
  from: number;
  to: number;
};

export const MyFacility = ({ from, to }: Props) => {
  const { user } = useSelector(
    ({ user }: ReduxState): User => ({
      user: user.current.data,
    })
  );
  const facilityName = user!.healthFacilityName;

  const myFacilityStatsQuery = useQuery({
    queryKey: ['MyFacilitiyStats', facilityName, from, to],
    queryFn: () => getFacilityStatisticsAsync(facilityName, from, to),
  });

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        During this period, your facility has assessed:
      </Typography>

      <Divider sx={{ ...DIVIDER_SX, marginBottom: '2rem' }} />

      <StatisticDashboard statsQuery={myFacilityStatsQuery} />
    </Box>
  );
};
