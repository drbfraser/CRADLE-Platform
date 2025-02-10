import { Box, Divider, Typography } from '@mui/material';

import { getUserStatisticsExportAsync } from 'src/shared/api/api';
import { useAppSelector } from 'src/shared/hooks';
import { selectCurrentUser } from 'src/redux/reducers/user/currentUser';
import { useUserStatsQuery } from './utils/queries';
import { ExportStatistics } from './utils/ExportStatistics';
import { StatisticDashboard } from './utils/StatisticsDashboard';
import { DIVIDER_SX, STATS_PAGE_SX } from './utils/statisticStyles';

type MyStatisticsProps = {
  from: number;
  to: number;
};

export const MyStatistics = ({ from, to }: MyStatisticsProps) => {
  const { data: currentUser } = useAppSelector(selectCurrentUser);
  const userId = currentUser?.id;

  // query only runs when userId is defined so we can use the non-null assertion operator
  const myStatsQuery = useUserStatsQuery(userId!.toString(), from, to);

  return (
    <Box sx={STATS_PAGE_SX}>
      <Box sx={{ float: 'left' }}>
        <Typography variant="h5" component="h5" gutterBottom>
          During this period, you have assessed:
        </Typography>
      </Box>
      <Box sx={{ float: 'right' }}>
        {userId && (
          <ExportStatistics
            getData={() =>
              getUserStatisticsExportAsync(userId.toString(), from, to)
            }
          />
        )}
      </Box>

      <Divider
        sx={{ ...DIVIDER_SX, marginTop: '4rem', marginBottom: '2rem' }}
      />

      {userId && <StatisticDashboard statsQuery={myStatsQuery} />}
    </Box>
  );
};
