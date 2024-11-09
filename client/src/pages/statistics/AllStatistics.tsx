import Divider from '@mui/material/Divider';
import { StatisticDashboard } from './utils/StatisticsInfo';
import Typography from '@mui/material/Typography';
import { getAllStatisticsAsync } from 'src/shared/api/api';
import { DIVIDER_SX, STATS_PAGE_SX } from './utils/statisticStyles';
import { Box } from '@mui/material';

type Props = {
  from: number;
  to: number;
};

export const AllStatistics = ({ from, to }: Props) => {
  return (
    <Box id={'all-stats-container'} sx={STATS_PAGE_SX}>
      <Typography variant="h5" gutterBottom>
        During this period, all users and facilities have assessed:
      </Typography>
      <Divider sx={DIVIDER_SX} />
      <br />
      <StatisticDashboard getData={() => getAllStatisticsAsync(from, to)} />
    </Box>
  );
};
