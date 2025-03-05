import { useQuery } from '@tanstack/react-query';
import { Box, Divider, Typography } from '@mui/material';

import { StatisticDashboard } from './utils/StatisticsDashboard';
import { DIVIDER_SX } from './utils/statisticStyles';
import { getFacilityStatisticsAsync } from 'src/shared/api/apiStatistics';
import { useAppSelector } from 'src/shared/hooks';
import { selectCurrentUser } from 'src/redux/user-state';

type Props = {
  from: number;
  to: number;
};

export const MyFacility = ({ from, to }: Props) => {
  const user = useAppSelector(selectCurrentUser);
  const facilityName = user!.healthFacilityName;

  const myFacilityStatsQuery = useQuery({
    queryKey: ['MyFacilityStats', facilityName, from, to],
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
