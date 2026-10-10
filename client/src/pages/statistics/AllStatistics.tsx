import Divider from '@mui/material/Divider';
import { StatisticDashboard } from './utils/StatisticsDashboard';
import { getAllStatisticsAsync } from 'src/shared/api';
import { DIVIDER_SX, STATS_PAGE_SX } from './utils/statisticStyles';
import { Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

type Props = {
  from: number;
  to: number;
};

export const AllStatistics = ({ from, to }: Props) => {
  const allStatsQuery = useQuery({
    queryKey: ['AllStatistics', from, to],
    queryFn: () => getAllStatisticsAsync(from, to),
  });

  return (
    <Box id="all-stats-container" sx={STATS_PAGE_SX}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontSize: {
            xs: '1rem',
            sm: '1.5rem',
          },
        }}>
        During this period, all users and facilities have assessed:
      </Typography>

      <Divider sx={DIVIDER_SX} />

      <StatisticDashboard statsQuery={allStatsQuery} />
    </Box>
  );
};
