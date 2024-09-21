import Divider from '@mui/material/Divider';
import { StatisticDashboard } from './utils/StatisticDashboard';
import Typography from '@mui/material/Typography';
import { getAllStatisticsAsync } from 'src/shared/api';
import { DIVIDER_SX } from './utils/statisticStyles';
import { Box } from '@mui/material';

interface IProps {
  from: number;
  to: number;
}

export const AllStatistics: React.FC<IProps> = ({ from, to }) => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        During this period, all users and facilities have assessed:
      </Typography>
      <Divider sx={DIVIDER_SX} />
      <br />
      <StatisticDashboard getData={() => getAllStatisticsAsync(from, to)} />
    </Box>
  );
};
