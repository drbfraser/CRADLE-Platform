import { Box, Divider, Typography, useMediaQuery } from '@mui/material';
import { getUserStatisticsExportAsync } from 'src/shared/api';
import { useUserStatsQuery } from './utils/queries';
import { ExportStatistics } from './utils/ExportStatistics';
import { StatisticDashboard } from './utils/StatisticsDashboard';
import { DIVIDER_SX, STATS_PAGE_SX } from './utils/statisticStyles';
import { useCurrentUser } from 'src/shared/hooks/auth/useCurrentUser';

type MyStatisticsProps = {
  from: number;
  to: number;
};

export const MyStatistics = ({ from, to }: MyStatisticsProps) => {
  const currentUser = useCurrentUser();
  const userId = currentUser?.id;

  // query only runs when userId is defined so we can use the non-null assertion operator
  const myStatsQuery = useUserStatsQuery(userId!.toString(), from, to);
  const isMobile = useMediaQuery('(max-width:720px)');

  return (
    <Box sx={STATS_PAGE_SX}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: 1,
        }}>
        <Typography
          variant="h5"
          component="h5"
          gutterBottom
          sx={{
            fontSize: {
              xs: '0.8rem',
              sm: '1.5rem',
            },
          }}>
          {isMobile
            ? 'Your assessments this period:'
            : 'During this period, you have assessed:'}
        </Typography>
        {userId && (
          <ExportStatistics
            getData={() =>
              getUserStatisticsExportAsync(userId.toString(), from, to)
            }
          />
        )}
      </Box>

      <Divider
        sx={{
          ...DIVIDER_SX,
          marginBottom: '2rem',
        }}
      />

      {userId && <StatisticDashboard statsQuery={myStatsQuery} />}
    </Box>
  );
};
